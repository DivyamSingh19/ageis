import prisma from "../../db/prisma";
import { Request, Response } from "express";
import { HTTPStatus } from "../../services/http/status";
import { getAgeisClient } from "../../blockchain/server.client";
import { Keypair, PublicKey } from "@solana/web3.js";
export class OrderController {
    create = async (req: Request, res: Response) => {
        try {
            const {userId,productId} = req.body;
            if (!userId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "User ID not found in request"
                });
            }

           
            if (!productId) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            const product = await prisma.products.findUnique({
                where: { id: productId }
            });

            if (!product) {
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const order = await prisma.order.create({
                data: {
                    userId,
                    productId,
                    farmerId: product.farmerId,

                    quantity: 1
                }
            });

            // --- Blockchain NFT Minting ---
            try {
                const farmerKeys = await prisma.farmerKeys.findUnique({
                    where: { farmerId: product.farmerId }
                });

                if (farmerKeys) {
                    const client = getAgeisClient();
                    const mintKeypair = Keypair.generate();
                    const baseUrl = process.env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get("host")}`;
                    const metadataUri = `${baseUrl}/api/metadata/products/${productId}`;

                    const signature = await client.mintProductNft({
                        orderId: order.id,
                        productName: product.name.slice(0, 32),
                        metadataUri,
                        farmerWallet: new PublicKey(farmerKeys.publicKey)
                    }, mintKeypair);

                    await prisma.orderNFT.create({
                        data: {
                            id: order.id,
                            tokenId: mintKeypair.publicKey.toBase58(),
                            signature: signature
                        }
                    });

                    console.log(`[OrderController] NFT minted for order ${order.id}: ${signature}`);
                } else {
                    console.warn(`[OrderController] Farmer keys not found for farmer ${product.farmerId}. Skipping NFT mint.`);
                }
            } catch (blockchainError) {
                console.error("[OrderController] Blockchain NFT minting failed:", blockchainError);
                // We don't fail the entire request if NFT minting fails, but we log it.
            }

            return res.status(HTTPStatus.CREATED).json({
                success: true,
                message: "Order created successfully",

                data: order
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to create order",
                error: (error as Error).message
            });
        }
    }
    get = async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "User ID not found in request"
                });
            }

            const orders = await prisma.order.findMany({
                where: { userId },
                include: {
                    product: true,
                    nfc: true,
                    nft: true,
                    delivery: true
                }
            });

            return res.status(HTTPStatus.OK).json({
                success: true,
                data: orders
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to fetch orders",
                error: (error as Error).message
            });
        }
    }
    cancel = async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "User ID not found in request"
                });
            }

            const { orderId } = req.body;
            if (!orderId) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Order ID is required"
                });
            }

            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success: false,
                    message: "Order not found"
                });
            }

            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: { status: "CANCELED" }
            });

            return res.status(HTTPStatus.OK).json({
                success: true,
                message: "Order cancelled successfully",
                data: updatedOrder
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to cancel order",
                error: (error as Error).message
            });
        }
    }
}