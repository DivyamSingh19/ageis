import prisma from "@repo/db";
import { Request,Response } from "express";
import { HTTPStatus } from "../../services/http/status";
import { UserService } from "../../services/user/main";

export class UserProfileController{
    private userService: UserService
    constructor(){
        this.userService= new UserService()
    }
    create = async (req:Request,res:Response) => {
        try {
            const {
                addressLine01,
                addressLine02,
                phoneNumber,
            } = req.body
            if(!addressLine01||!addressLine02||!phoneNumber){
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success:false,
                    message:"Incomplete details for user profile creation"
                })
            }
        } catch (error) {
            
        }
    }
    get = async (req:Request,res:Response) => {
        try {
            const userId = req.body
            if(!userId){
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success:false,
                    message:"No userId found to fetch user"
                })
            }
        } catch (error) {
            
        }
    }
    edit = async (req:Request,res:Response) => {
        try {
            
        } catch (error) {
            
        }
    }
}