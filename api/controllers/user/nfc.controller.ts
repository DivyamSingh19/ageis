import { UserService } from "../../services/user/main";
import { OrderService } from "../../services/orders/main";
import prisma from "../../db/prisma";
import { Request,Response } from "express";
import { HTTPStatus } from "../../services/http/status";



export class NFCController{
    private userService:UserService
    private orderService:OrderService
    constructor(){
        this.userService = new UserService
        this.orderService = new OrderService
    }
    verify = async (req:Request,res:Response) => {
        try {
            const {nfcId} = req.body
            if(!nfcId){
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success:false,
                    message:"NFC ID is required"
                })
            }
            const nfc = await prisma.orderNFC.findUnique({
                where:{
                    nfcId
                }
            })
            if(!nfc){
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success:false,
                    message:"NFC not found"
                })
            }
            const order = await prisma.order.findUnique({
                where:{
                    id:nfc.orderId
                }
            })
            if(!order){
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success:false,
                    message:"Order not found"
                })
            }
            return res.status(HTTPStatus.OK).json({
                success:true,
                message:"NFC verified successfully",
                data:order
            })
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success:false,
                message:(error as Error).message
            })
        }
    }
}