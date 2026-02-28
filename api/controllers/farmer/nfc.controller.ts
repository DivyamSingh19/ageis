import { Request, Response } from "express";
import prisma from "../../db/prisma";
import { HTTPStatus } from "../../services/http/status";

export class NFCController {
    mount = async (req: Request, res: Response) => {
        try {
            const { orderId, nfcId } = req.body;
            const farmerId = req.farmerId;

            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            if (!orderId || !nfcId) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "orderId and nfcId are required",
                });
            }

            // Check if order exists and belongs to farmer
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order || order.farmerId !== farmerId) {
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success: false,
                    message: "Order not found",
                });
            }

            // Upsert OrderNFC record
            const mounted = await prisma.orderNFC.upsert({
                where: { orderId },
                update: { nfcId },
                create: {
                    orderId,
                    nfcId,
                },
            });

            return res.status(HTTPStatus.OK).json({
                success: true,
                message: "NFC tag mounted successfully",
                data: mounted,
            });
        } catch (error) {
            console.error("[NFCController.mount]", error);
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                error: (error as Error).message,
            });
        }
    };
}