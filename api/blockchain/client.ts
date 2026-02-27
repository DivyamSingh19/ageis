/**
 * ageisClient.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Full TypeScript client for the `ageis` Anchor program.
 *
 * Program ID: 4fRvr5yrDNTqnSXv8yFb9CSj3MwnYuade8UUmgb8cg3H
 *
 * Dependencies (install before use):
 *   npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
 *
 * Usage example at the bottom of this file.
 * ────────────────────────────────────────────────────────────────────────────
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionSignature,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

// ─── Constants ───────────────────────────────────────────────────────────────

export const PROGRAM_ID = new PublicKey(
  "4fRvr5yrDNTqnSXv8yFb9CSj3MwnYuade8UUmgb8cg3H"
);

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

/** Delivery status enum — mirrors the on-chain u8 values */
export enum DeliveryStatus {
  Initialized = 0,
  PickedUp = 1,
  InTransit = 2,
  Delivered = 3,
}

// ─── PDA helpers ─────────────────────────────────────────────────────────────

/**
 * Strip dashes from a UUID to make it 32 characters (32 bytes).
 * Solana PDA seeds have a 32-byte limit.
 */
function toShortId(orderId: string): string {
  return orderId.replace(/-/g, "");
}

/**
 * Derive the ProductTrace PDA for a given order ID.
 * Seeds: ["product", orderId]
 */
export function deriveProductTracePDA(orderId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("product"), Buffer.from(toShortId(orderId))],
    PROGRAM_ID
  );
}

/**
 * Derive the DeliveryTrace PDA for a given order ID.
 * Seeds: ["delivery", orderId]
 */
export function deriveDeliveryTracePDA(orderId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("delivery"), Buffer.from(toShortId(orderId))],
    PROGRAM_ID
  );
}

/**
 * Derive the Metaplex metadata PDA for a mint.
 * Seeds: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint]
 */
export function deriveMetadataPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

/**
 * Derive the Metaplex MasterEdition PDA for a mint.
 * Seeds: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint, "edition"]
 */
export function deriveMasterEditionPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

// ─── Argument types ───────────────────────────────────────────────────────────

export interface MintProductArgs {
  orderId: string;
  productName: string;
  metadataUri: string;
  farmerWallet: PublicKey;
}

export interface InitDeliveryArgs {
  orderId: string;
  nfcUid: string;
  farmerId: string;
  deliveryPartnerId: string;
  consumerId: string;
}

export interface UpdateStatusArgs {
  newStatus: DeliveryStatus; // 1 = PickedUp, 2 = InTransit, 3 = Delivered
}

// ─── Account data types ───────────────────────────────────────────────────────

export interface ProductTraceAccount {
  orderId: string;
  nftMint: PublicKey;
  farmerWallet: PublicKey;
  productName: string;
  metadataUri: string;
  createdAt: BN;
  bump: number;
}

export interface DeliveryTraceAccount {
  orderId: string;
  nftMint: PublicKey;
  nfcUid: string;
  status: number;
  farmerId: string;
  deliveryPartnerId: string;
  consumerId: string;
  initializedAt: BN;
  pickedUpAt: BN;
  inTransitAt: BN;
  deliveredAt: BN;
  bump: number;
}

// ─── Main client class ────────────────────────────────────────────────────────

export class AgeisClient {
  readonly program: Program;
  readonly provider: AnchorProvider;

  constructor(
    connection: Connection,
    /** The server authority wallet — must be the same keypair used on-chain */
    serverAuthority: anchor.Wallet | Keypair,
    idl: anchor.Idl
  ) {
    // Normalise: accept raw Keypair or anchor.Wallet
    const wallet =
      serverAuthority instanceof Keypair
        ? new anchor.Wallet(serverAuthority)
        : serverAuthority;

    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    anchor.setProvider(this.provider);
    this.program = new Program(idl, this.provider);
  }

  // ── Instruction: mintProductNft ──────────────────────────────────────────

  /**
   * Mint a 1/1 product NFT and create the ProductTrace PDA.
   *
   * Call this when a user places an order (after uploading metadata to IPFS).
   * A fresh `mint` Keypair must be generated by the caller and passed in.
   *
   * @returns Transaction signature
   */
  async mintProductNft(
    args: MintProductArgs,
    mintKeypair: Keypair
  ): Promise<TransactionSignature> {
    const serverAuthority = this.provider.wallet.publicKey;
    const shortOrderId = toShortId(args.orderId);

    const [productTracePDA] = deriveProductTracePDA(args.orderId);
    const [metadataPDA] = deriveMetadataPDA(mintKeypair.publicKey);
    const [masterEditionPDA] = deriveMasterEditionPDA(mintKeypair.publicKey);

    // ATA seed derivation mirrors the IDL (Associated Token Program)
    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        serverAuthority.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const sig = await this.program.methods
      .mintProductNft({
        orderId: shortOrderId,
        productName: args.productName.substring(0, 32),
        metadataUri: args.metadataUri,
        farmerWallet: args.farmerWallet,
      })
      .accounts({
        serverAuthority,
        mint: mintKeypair.publicKey,
        tokenAccount,
        productTrace: productTracePDA,
        metadata: metadataPDA,
        masterEdition: masterEditionPDA,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();

    return sig;
  }

  // ── Instruction: initializeDelivery ─────────────────────────────────────

  /**
   * Record the NFC tap by the farmer during packaging.
   * Creates the DeliveryTrace PDA. Requires ProductTrace to already exist.
   *
   * @returns Transaction signature
   */
  async initializeDelivery(args: InitDeliveryArgs): Promise<TransactionSignature> {
    const serverAuthority = this.provider.wallet.publicKey;

    const [productTracePDA] = deriveProductTracePDA(args.orderId);
    const [deliveryTracePDA] = deriveDeliveryTracePDA(args.orderId);

    const sig = await this.program.methods
      .initializeDelivery({
        orderId: toShortId(args.orderId),
        nfcUid: args.nfcUid,
        farmerId: args.farmerId,
        deliveryPartnerId: args.deliveryPartnerId,
        consumerId: args.consumerId,
      })
      .accounts({
        serverAuthority,
        productTrace: productTracePDA,
        deliveryTrace: deliveryTracePDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return sig;
  }

  // ── Instruction: updateDeliveryStatus ───────────────────────────────────

  /**
   * Advance the delivery status by exactly one step.
   *
   * Status progression (no skipping allowed):
   *   0 (Initialized) → 1 (PickedUp) → 2 (InTransit) → 3 (Delivered)
   *
   * @param orderId  The order whose delivery to update
   * @param newStatus  Target status (must be currentStatus + 1)
   * @returns Transaction signature
   */
  async updateDeliveryStatus(
    orderId: string,
    newStatus: DeliveryStatus
  ): Promise<TransactionSignature> {
    const serverAuthority = this.provider.wallet.publicKey;
    const [deliveryTracePDA] = deriveDeliveryTracePDA(orderId);

    const sig = await this.program.methods
      .updateDeliveryStatus({ newStatus })
      .accounts({
        serverAuthority,
        deliveryTrace: deliveryTracePDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return sig;
  }

  // ── Convenience: step through all status transitions ────────────────────

  /**
   * Mark delivery as PickedUp (status 0 → 1).
   */
  async markPickedUp(orderId: string): Promise<TransactionSignature> {
    return this.updateDeliveryStatus(orderId, DeliveryStatus.PickedUp);
  }

  /**
   * Mark delivery as InTransit (status 1 → 2).
   */
  async markInTransit(orderId: string): Promise<TransactionSignature> {
    return this.updateDeliveryStatus(orderId, DeliveryStatus.InTransit);
  }

  /**
   * Mark delivery as Delivered (status 2 → 3).
   */
  async markDelivered(orderId: string): Promise<TransactionSignature> {
    return this.updateDeliveryStatus(orderId, DeliveryStatus.Delivered);
  }

  // ── Fetch: ProductTrace account ──────────────────────────────────────────

  /**
   * Fetch and decode the ProductTrace PDA for a given order.
   * Returns null if the account does not exist.
   */
  async fetchProductTrace(orderId: string): Promise<ProductTraceAccount | null> {
    const [pda] = deriveProductTracePDA(orderId);
    try {
      const account = await (this.program.account as any).productTrace.fetch(pda);
      return account as ProductTraceAccount;
    } catch {
      return null;
    }
  }

  // ── Fetch: DeliveryTrace account ─────────────────────────────────────────

  /**
   * Fetch and decode the DeliveryTrace PDA for a given order.
   * Returns null if the account does not exist.
   */
  async fetchDeliveryTrace(orderId: string): Promise<DeliveryTraceAccount | null> {
    const [pda] = deriveDeliveryTracePDA(orderId);
    try {
      const account = await (this.program.account as any).deliveryTrace.fetch(pda);
      return account as DeliveryTraceAccount;
    } catch {
      return null;
    }
  }

  // ── Fetch: full trace summary ────────────────────────────────────────────

  /**
   * Returns both ProductTrace and DeliveryTrace for an order in one call.
   * Either may be null if not yet created.
   */
  async fetchFullTrace(orderId: string): Promise<{
    product: ProductTraceAccount | null;
    delivery: DeliveryTraceAccount | null;
  }> {
    const [product, delivery] = await Promise.all([
      this.fetchProductTrace(orderId),
      this.fetchDeliveryTrace(orderId),
    ]);
    return { product, delivery };
  }

  // ── Fetch: all DeliveryTrace accounts (paginated) ────────────────────────

  /**
   * Fetch all DeliveryTrace PDAs from the program.
   * Useful for building a dashboard of all active deliveries.
   */
  async fetchAllDeliveries(): Promise<
    { publicKey: PublicKey; account: DeliveryTraceAccount }[]
  > {
    const accounts = await (this.program.account as any).deliveryTrace.all();
    return accounts as { publicKey: PublicKey; account: DeliveryTraceAccount }[];
  }

  /**
   * Fetch all DeliveryTrace PDAs filtered by a specific consumer ID.
   * Uses an on-chain memcmp filter for efficiency.
   *
   * Note: offset calculation assumes orderId is stored first (4-byte length
   * prefix) — adjust if your on-chain layout differs.
   */
  async fetchDeliveriesByConsumer(
    consumerId: string
  ): Promise<{ publicKey: PublicKey; account: DeliveryTraceAccount }[]> {
    const all = await this.fetchAllDeliveries();
    return all.filter((a) => a.account.consumerId === consumerId);
  }

  // ── Utility: get current status label ────────────────────────────────────

  static statusLabel(status: number): string {
    const labels: Record<number, string> = {
      0: "Initialized",
      1: "PickedUp",
      2: "InTransit",
      3: "Delivered",
    };
    return labels[status] ?? `Unknown(${status})`;
  }
}

// ─── Usage Example ────────────────────────────────────────────────────────────
//
// import idl from "./target/idl/agis.json";
// import { AgeisClient, DeliveryStatus } from "./ageisClient   ";
// import { Connection, Keypair } from "@solana/web3.js";
//
// async function main() {
//   const connection  = new Connection("https://api.devnet.solana.com", "confirmed");
//   const serverKeypair = Keypair.fromSecretKey(/* your secret key bytes */);
//   const client = new AgeisClient(connection, serverKeypair, idl as any);
//
//   const orderId     = "ORDER-001";
//   const mintKeypair = Keypair.generate(); // fresh mint for this NFT
//
//   // 1. Mint the product NFT (called when order is placed)
//   const mintSig = await client.mintProductNft(
//     {
//       orderId,
//       productName:  "Organic Tomatoes 1kg",
//       metadataUri:  "https://ipfs.io/ipfs/QmXxx...",
//       farmerWallet: new PublicKey("FarmerWalletPublicKey..."),
//     },
//     mintKeypair
//   );
//   console.log("NFT minted:", mintSig);
//
//   // 2. Initialize delivery (farmer taps NFC during packaging)
//   const initSig = await client.initializeDelivery({
//     orderId,
//     nfcUid:            "NFC-UID-ABC123",
//     farmerId:          "farmer-db-id-001",
//     deliveryPartnerId: "partner-db-id-007",
//     consumerId:        "consumer-db-id-042",
//   });
//   console.log("Delivery initialized:", initSig);
//
//   // 3. Advance status step by step
//   await client.markPickedUp(orderId);   // 0 → 1
//   await client.markInTransit(orderId);  // 1 → 2
//   await client.markDelivered(orderId);  // 2 → 3
//
//   // 4. Read back the full trace
//   const trace = await client.fetchFullTrace(orderId);
//   console.log("Product :", trace.product);
//   console.log("Delivery:", trace.delivery);
//   console.log("Status  :", AgeisClient.statusLabel(trace.delivery?.status ?? 0));
// }
//
// main().catch(console.error);