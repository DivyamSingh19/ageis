import prisma from "../../db/prisma";
import { Request,Response } from "express"
import { HTTPStatus } from "../../services/http/status";


export class DeliveryController{
    initialize = async (req:Request,res:Response) => {
        try {
            const farmerId = req.body;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
                });
            }
            const { orderId, deliveryDetails } = req.body;
            if (!orderId || !deliveryDetails) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Order ID and delivery details are required"
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
                    
                    details: deliveryDetails
                }            });
            return res.status(HTTPStatus.CREATED).json({
                success: true,
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
    get = async (req:Request,res:Response) => {
        try {
            const farmerId = req.body
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
                            nfc:true,
                            nft:true
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
    updateStatus = async (req:Request,res:Response) => {
        try {
            const farmerId = req.body;
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
    getOrders = async (req:Request,res:Response) => {
        try {
            const farmerId = req.body;
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
    getOrderById = async (req:Request,res:Response) => {
        try {
            const farmerId = req.body;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
                });
            }
            
            const orderId = req.body;
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    product: true,
                    nfc:true,
                    nft:true,
                    delivery:true 
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
} 