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
            
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success:false,
                message:(error as Error).message
            })
        }
    }
}