import prisma from "../../db/prisma";
import { Request, Response } from "express";
import { HTTPStatus } from "../../services/http/status";

export class DeliveryController {
    initialize = async (req: Request, res: Response) => {
        try {
            const farmerId = req.farmerId;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
                });
            }

            const { orderId, deliveryDetails } = req.body;
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

            const delivery = await prisma.delivery.create({
                data: {
                    orderId,
                    farmerId,
                    details: deliveryDetails || {}
                }
            });

            return res.status(HTTPStatus.CREATED).json({
                success: true,
                message: "Delivery initialized successfully",
                data: delivery
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to initialize delivery",
                error: (error as Error).message
            });
        }
    }

    get = async (req: Request, res: Response) => {
        try {
            const farmerId = req.farmerId;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
                });
            }

            const deliveries = await prisma.delivery.findMany({
                where: { farmerId },
                include: {
                    order: {
                        include: {
                            product: true,
                            nfc: true,
                            nft: true
                        }
                    }
                }
            });

            return res.status(HTTPStatus.OK).json({
                success: true,
                data: deliveries
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to fetch deliveries",
                error: (error as Error).message
            });
        }
    }

    updateStatus = async (req: Request, res: Response) => {
        try {
            const farmerId = req.farmerId;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
                });
            }

            const { deliveryId, status } = req.body;
            if (!deliveryId || !status) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Delivery ID and status are required"
                });
            }

            const delivery = await prisma.delivery.findUnique({
                where: { id: deliveryId }
            });

            if (!delivery) {
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success: false,
                    message: "Delivery not found"
                });
            }

            const updatedDelivery = await prisma.delivery.update({
                where: { id: deliveryId },
                data: { status }
            });

            return res.status(HTTPStatus.OK).json({
                success: true,
                message: "Delivery status updated",
                data: updatedDelivery
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to update delivery status",
                error: (error as Error).message
            });
        }
    }

    getOrders = async (req: Request, res: Response) => {
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

    getOrderById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const order = await prisma.order.findUnique({
                where: { id: id as string },
                include: {
                    product: true,
                    nfc: true,
                    nft: true,
                    delivery: true
                }
            });

            if (!order) {
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success: false,
                    message: "Order not found"
                });
            }

            return res.status(HTTPStatus.OK).json({
                success: true,
                data: order
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to fetch order",
                error: (error as Error).message
            });
        }
    }

    associateNFC = async (req: Request, res: Response) => {
        try {
            const { orderId, nfcId } = req.body;
            if (!orderId || !nfcId) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Order ID and NFC ID are required"
                });
            }

            const nfcEntry = await prisma.orderNFC.upsert({
                where: { orderId: orderId as string },
                update: { nfcId: nfcId as string },
                create: { orderId: orderId as string, nfcId: nfcId as string }
            });

            return res.status(HTTPStatus.OK).json({
                success: true,
                message: "NFC ID associated successfully",
                data: nfcEntry
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to associate NFC",
                error: (error as Error).message
            });
        }
    }

    getOrderByNFC = async (req: Request, res: Response) => {
        try {
            const { nfcId } = req.body;
            const nfcEntry = await prisma.orderNFC.findUnique({
                where: { nfcId },
                include: {
                    Order: {
                        include: {
                            product: { include: { nft: true } },
                            nft: true,
                            user: { select: { id: true, name: true, email: true } },
                            farmer: { select: { id: true, name: true } },
                            delivery: true
                        }
                    }
                }
            });

            if (!nfcEntry) {
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success: false,
                    message: "NFC not associated with any order"
                });
            }

            return res.status(HTTPStatus.OK).json({
                success: true,
                data: (nfcEntry as any).Order
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to fetch order by NFC",
                error: (error as Error).message
            });
        }
    }
} 