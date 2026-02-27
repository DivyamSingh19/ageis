import { ProductService } from "../../services/products/main";
import { Request, Response } from "express";
import prisma from "../../db/prisma";
import { getAgeisClient } from "../../blockchain/server.client";
import { Keypair, PublicKey } from "@solana/web3.js";
import { HTTPStatus } from "../../services/http/status";
import { withRetry } from "../../utils/db-utils";

// ─── Controller ───────────────────────────────────────────────────────────────
export const verifyProductWithGemini = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ error: "productId required" });
    }

    // ── 1. ONE query — get everything we need in a single round-trip ──────
    // Joins product + NFT + farmerKeys in one shot, zero extra calls.
    const productRow = await withRetry(() =>
      prisma.products.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          verified: true,
          farmerId: true,
          // pull NFT + farmer keys via relations in the same query
          nft: true,
          farmer: {
            select: {
              keys: {
                select: { publicKey: true },
              },
            },
          },
        },
      })
    );

    if (!productRow) {
      return res
        .status(HTTPStatus.NOT_FOUND)
        .json({ error: "Product not found" });
    }

    // ── 2. Already minted — short-circuit immediately ─────────────────────
    if (productRow.nft) {
      return res.json({
        productId,
        status: "already_minted",
        mint: {
          address: productRow.nft.tokenId,
          signature: productRow.nft.signature ?? "already-minted",
        },
      });
    }

    // ── 3. Guard: farmer wallet must exist ────────────────────────────────
    const farmerPublicKey = productRow.farmer?.keys?.publicKey;
    if (!farmerPublicKey) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        error: "Farmer wallet not found. Create wallet first.",
      });
    }

    // ── 4. Respond immediately — don't hold the HTTP connection open ──────
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey.toBase58();

    res.json({
      productId,
      status: "minting",
      mint: { address: mintAddress, signature: null },
      message:
        "NFT minting has started. Poll /api/products/:id/nft for status.",
    });

    // ── 5. Background: mint on-chain then persist ─────────────────────────
    mintAndPersist({
      product: { id: productRow.id, name: productRow.name },
      farmerPublicKey,
      mintKeypair,
      baseUrl:
        process.env.PUBLIC_BASE_URL ??
        `${req.protocol}://${req.get("host")}`,
    }).catch((err) => {
      console.error(
        `[mint] background job failed for product ${productId}:`,
        err
      );
    });
  } catch (err: any) {
    console.error("verifyProductWithGemini error:", err);
    return res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Minting failed", details: err.message });
  }
};

// ─── Background mint job ──────────────────────────────────────────────────────
interface MintJobArgs {
  product: { id: string; name: string };
  farmerPublicKey: string;
  mintKeypair: Keypair;
  baseUrl: string;
}

async function mintAndPersist({
  product,
  farmerPublicKey,
  mintKeypair,
  baseUrl,
}: MintJobArgs): Promise<void> {
  const metadataUri = `${baseUrl}/api/metadata/products/${product.id}`.substring(
    0,
    200
  );

  // ── Blockchain call (slow — up to 30s on devnet) ──────────────────────
  const client = getAgeisClient();
  const sig = await client.mintProductNft(
    {
      orderId: product.id,
      productName: product.name.substring(0, 32),
      metadataUri,
      farmerWallet: new PublicKey(farmerPublicKey),
    },
    mintKeypair
  );

  console.log(`[mint] NFT minted for product ${product.id} | sig: ${sig}`);

  // ── Persist atomically — single transaction, no extra reads ──────────
  await withRetry(() =>
    prisma.$transaction([
      prisma.products.update({
        where: { id: product.id },
        data: { verified: true },
      }),
      prisma.productNFT.create({
        data: {
          id: product.id,
          tokenId: mintKeypair.publicKey.toBase58(),
          signature: sig,
        },
      }),
    ])
  );

  console.log(`[mint] DB updated for product ${product.id}`);
}
