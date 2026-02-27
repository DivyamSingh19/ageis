import axios from "axios";
import { analyzeProductImage } from "../../config/gemini";
import { SEASONALITY_MAP } from "../../rules/seasonality.rules";
import { ProductService } from "../../services/products/main";
import { Request, Response } from "express";
import prisma from "../../db/prisma";
import { getAgeisClient } from "../../blockchain/server.client";
import { Keypair, PublicKey } from "@solana/web3.js";
import { HTTPStatus } from "../../services/http/status";

export const verifyProductWithGemini = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(HTTPStatus.BAD_REQUEST).json({ error: "productId required" });
    }

    const product = await ProductService.getById(productId);

    if (!product) {
      return res.status(HTTPStatus.NOT_FOUND).json({ error: "Product not found" });
    }

    if (!product.pinataImageUrl || product.pinataImageUrl.length === 0) {
      return res.status(HTTPStatus.BAD_REQUEST).json({ error: "Product has no image URL" });
    }

    const imageUrl = product.pinataImageUrl[0];

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer"
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // Gemini analysis
    const aiResult = await analyzeProductImage({
      imageBuffer,
      productName: product.name,
      country: "India"
    });

    const matches = aiResult.verified === true;

    // If verified, mint the NFT (server-custodied) and persist mint address.
    let mint: { address: string; signature: string } | null = null;
    if (matches) {
      const existing = await prisma.productNFT.findUnique({
        where: { id: product.id },
      });

      if (existing) {
        mint = { address: existing.tokenId, signature: "already-minted" };
      } else {
        const farmerKeys = await prisma.farmerKeys.findUnique({
          where: { farmerId: product.farmerId },
        });

        if (!farmerKeys) {
          return res.status(HTTPStatus.BAD_REQUEST).json({
            error: "Farmer wallet not found. Create wallet first.",
          });
        }

        const baseUrl =
          process.env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get("host")}`;
        const metadataUri = `${baseUrl}/api/metadata/products/${product.id}`;

        const client = getAgeisClient();
        const mintKeypair = Keypair.generate();

        const sig = await client.mintProductNft(
          {
            orderId: product.id,
            productName: product.name,
            metadataUri,
            farmerWallet: new PublicKey(farmerKeys.publicKey),
          },
          mintKeypair
        );

        await prisma.$transaction([
          prisma.products.update({
            where: { id: product.id },
            data: { verified: true },
          }),
          prisma.productNFT.create({
            data: {
              // ProductNFT.id is also the FK to Products.id (1:1)
              id: product.id,
              tokenId: mintKeypair.publicKey.toBase58(),
            },
          }),
        ]);

        mint = {
          address: mintKeypair.publicKey.toBase58(),
          signature: sig,
        };
      }
    }

    return res.json({
      productId,
      matches,
      reasoning: aiResult.reason,
      aiRaw: aiResult,
      mint,
    });
  } catch (err: any) {
    console.error("Gemini verification error:", err.message);
    return res.status(500).json({
      error: "Verification failed",
      details: err.message
    });
  }
};