import prisma from "../../db/prisma";
import { Request,Response } from "express";
import { HTTPStatus } from "../../services/http/status";
export class OrderController{
    create = async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "User ID not found in request"
                });
            }

            const { productId } = req.body;
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
                    farmerId:product.farmerId,
                    quantity:1
                }
            });

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
                    product: true
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
                data: { status: }
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