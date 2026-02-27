
import { getAgeisClient } from "./blockchain/server.client";
import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

async function checkProduct(productId: string) {
    try {
        const client = getAgeisClient();
        console.log(`Checking on-chain trace for product: ${productId}`);

        const trace = await client.fetchProductTrace(productId);

        if (trace) {
            console.log("SUCCESS: ProductTrace found on-chain!");
            console.log("Mint:", trace.nftMint.toBase58());
            console.log("Farmer:", trace.farmerWallet.toBase58());
            console.log("Metadata URI:", trace.metadataUri);
        } else {
            console.log("FAILURE: No ProductTrace found on-chain.");
        }
    } catch (err) {
        console.error("Error checking product trace:", err);
    }
}

const targetProductId = "e00ae437-91aa-43e4-88ed-1fd43bbd92e3";
checkProduct(targetProductId);
