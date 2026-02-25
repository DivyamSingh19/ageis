import { Request,Response,NextFunction } from "express";
import { HTTPStatus } from "../services/http/status";



export const userAuth = async (req:Request,res:Response,next:NextFunction) => {
    try {
        
    } catch (error) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:(error as Error).message
        })
    }
}