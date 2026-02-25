import prisma from "../../db/prisma";
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
                postalCode
            } = req.body
            if(!addressLine01||!addressLine02||!phoneNumber || !postalCode){
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success:false,
                    message:"Incomplete details for user profile creation"
                })
            }
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success:false,
                message:"Failed to create user profile",
                error:JSON.stringify(error)
            })
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
            const userProfile = await prisma.userProfile.findUnique({
                where:{
                    userId
                },
                select:{
                    addressLine01:true,
                    addressLine02:true,
                    phoneNumber:true
                }
            })

            if(!userProfile){
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success:false,
                    message:"No user profile found with the given userId"
                })
            }
        } catch (error) {
              return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success:false,
                message:"Failed to create user profile",
                error:JSON.stringify(error)
            })
        }
    }
    edit = async (req:Request,res:Response) => {
        try {
            const {
                addressLine01,
                addressLine02,
                phoneNumber,    
                postalCode
            } = req.body
            const userId = req.body
            if(!userId){
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success:false,
                    message:"No userId found to fetch user"
                })
            }
            if(!addressLine01||!addressLine02||!phoneNumber || !postalCode){
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success:false,
                    message:"Incomplete details for user profile creation"
                })
            }
            const userProfile = await prisma.userProfile.findUnique({
                where:{
                    userId
                }
            })
            if(!userProfile){
                return res.status(HTTPStatus.NOT_FOUND).json({
                    success:false,
                    message:"No user profile found with the given userId"
                })
            }
            const updatedProfile = await prisma.userProfile.update({
                where:{
                    userId
                },  
                data:{
                    addressLine01,
                    addressLine02,  
                    phoneNumber,
                    postalCode
                },
                select:{    
                    addressLine01:true,
                    addressLine02:true,
                    phoneNumber:true,
                    postalCode:true
                }
            })  
            return res.status(HTTPStatus.OK).json({
                success:true,
                message:"User profile updated successfully",
                data:updatedProfile
            })

        } catch (error) {
              return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success:false,
                message:"Failed to update user profile",
                error:JSON.stringify(error)
            })
        }
    }
}