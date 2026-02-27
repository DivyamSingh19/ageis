import { PrismaClient } from '@prisma/client';
import { getAgeisClient, getServerAuthorityKeypair } from './blockchain/server.client';
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const prisma = new PrismaClient();

async function testOrderPlacement() {
    const logFile = 'order_test_log.txt';
    const logger = (msg: string) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    fs.writeFileSync(logFile, `--- Test Run ${new Date().toISOString()} ---\n`);

    const userId = '7fb443f4-20bc-47e3-87a8-fd9e0e5da06a';
    const productId = '1a1a719b-69a4-4c93-9b31-51e34dde02ac';

    logger('--- Testing Order Placement ---');

    const client = getAgeisClient();
    const serverAuthority = getServerAuthorityKeypair();

    const balance = await client.provider.connection.getBalance(serverAuthority.publicKey);
    logger(`Server Authority: ${serverAuthority.publicKey.toBase58()}`);
    logger(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    const product = await prisma.products.findUnique({
        where: { id: productId },
    });

    if (!product) {
        logger('Product not found');
        return;
    }

    // Use a standard valid UUID
    const testOrderId = uuidv4();

    // 1. Create Order
    const order = await prisma.order.create({
        data: {
            id: testOrderId,
            userId,
            productId,
            farmerId: product.farmerId,
            quantity: 1,
        },
    });

    logger(`Order created in DB: ${order.id}`);

    // 2. Mint NFT
    try {
        const farmerKeys = await prisma.farmerKeys.findUnique({
            where: { farmerId: product.farmerId },
        });

        if (farmerKeys) {
            const mintKeypair = Keypair.generate();
            const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
            const metadataUri = `${baseUrl}/api/metadata/products/${productId}`;

            logger('Minting NFT on Solana...');
            logger(`Mint Pubkey: ${mintKeypair.publicKey.toBase58()}`);

            const signature = await client.mintProductNft({
                orderId: order.id,
                productName: product.name,
                metadataUri,
                farmerWallet: new PublicKey(farmerKeys.publicKey),
            }, mintKeypair);

            logger(`NFT minted on Solana, signature: ${signature}`);

            // 3. Create OrderNFT in DB
            await prisma.orderNFT.create({
                data: {
                    id: order.id,
                    tokenId: mintKeypair.publicKey.toBase58(),
                    signature: signature,
                },
            });
            logger('OrderNFT record created in DB.');
        } else {
            logger('Farmer keys not found, skipping NFT mint.');
        }
    } catch (err: any) {
        logger(`NFT Minting failed: ${err.message}`);
        if (err.logs) {
            logger('Logs:');
            err.logs.forEach((l: string) => logger(`  ${l}`));
        }
    }

    await prisma.$disconnect();
}

testOrderPlacement().catch(console.error);
