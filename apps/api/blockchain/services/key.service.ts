import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {Keypair} from "@solana/web3.js";
export class KeyService {
  async isValidSolanaPublicKey(publicKey: string): Promise<boolean> {
    try {
      new PublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  }
  async generate() {
    try {
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const secretKey = bs58.encode(keypair.secretKey);
        return { publicKey, secretKey };
    } catch (error) {
        return null;
    }
  }
}
