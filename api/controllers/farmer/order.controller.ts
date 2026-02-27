import prisma from "../../db/prisma";
import { Request,Response } from "express"
import { HTTPStatus } from "../../services/http/status";

export class OrderController{
    get = async (req:Request,res:Response) => {
        try {
            const farmerId = req.farmerId;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
                });
            }

            const orders = await prisma.order.findMany({
                where: { farmerId },
                include: {
                    product: true,
                    nfc:true,
                    nft:true,
                    delivery:true 
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
    cancelOrder = async (req:Request,res:Response) => {
        try {
            const farmerId = req.body;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
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
                data: { status: "CANCELED"}
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