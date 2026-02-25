import { Request,Response } from "express"
import { HTTPStatus } from "../../services/http/status"
import prisma from "../../db/prisma"
import { hashPassword,validatePassword,createToken } from "../../utils/tokens"
export class AuthController{
    register = async (req:Request,res:Response) => {
        try {
             const {name,email,password} = req.body
             if(!name || !email || !password){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"All fields are required"})
             }    
             const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
             if(!regex.test(email)){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"Invalid email"})
             }
             const existingDeliveryPartner = await prisma.deliveryAgent.findUnique({
                where:{
                    email
                }             
            })
                if(existingDeliveryPartner){   
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Delivery Partner already exists"})
                }
                const hashedPassword = await hashPassword(password)
                const deliveryPartner = await prisma.deliveryAgent.create({
                    data:{
                        name,
                        email,
                        passwordHash:hashedPassword
                    }
                })
                const token = await createToken(deliveryPartner.id)
                if(!token){
                    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating token",token, email})
                }
                return res.status(HTTPStatus.CREATED).json({message:"Delivery Partner created successfully",token})
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating delivery partner",error})
        }
    }
    login = async (req:Request,res:Response) => {
        try {
            const {email,password} = req.body
            if(!email || !password){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"All fields are required"})
             }
                const deliveryPartner = await prisma.deliveryAgent.findUnique({
                    where:{
                        email
                    }
                })
                if(!deliveryPartner){
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Invalid credentials"})
                }
                const isValidPassword = await validatePassword(password,deliveryPartner.passwordHash)
                if(!isValidPassword){
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Invalid credentials"})
                }
                const token = await createToken(deliveryPartner.id)
                if(!token){
                    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating token"})
                }
                return res.status(HTTPStatus.OK).json({message:"Logged in successfully",token})

        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error logging in",error})
        }
    }

    me = async (req:Request,res:Response) => {
        try {
            const deliveryPartnerId = req.deliveryAgentId
            if(!deliveryPartnerId){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"Delivery Partner ID is required"})
            }
            const deliveryPartner  = await prisma.deliveryAgent.findUnique({
                where:{ 
                    id:deliveryPartnerId
                }
            })
            if(!deliveryPartner){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"Delivery Partner not found"})
            }
            return res.status(HTTPStatus.OK).json({message:"Delivery Partner found",deliveryPartner})  
            
        } catch (error) {   
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error fetching delivery partner",error})
        }
    }
}