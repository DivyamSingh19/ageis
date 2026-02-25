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
             const existingFarmer = await prisma.farmer.findUnique({
                where:{
                    email
                }             
            })
                if(existingFarmer){   
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Farmer already exists"})
                }
                const hashedPassword = await hashPassword(password)
                const farmer = await prisma.farmer.create({
                    data:{
                        name,
                        email,
                        passwordHash:hashedPassword
                    }
                })
                const token = await createToken(farmer.id)
                if(!token){
                    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating token",token, email})
                }
                return res.status(HTTPStatus.CREATED).json({message:"Farmer created successfully",})
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating farmer",error})
        }
    }
    login = async (req:Request,res:Response) => {
        try {
            const {email,password} = req.body
            if(!email || !password){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"All fields are required"})
             }
                const farmer = await prisma.farmer.findUnique({
                    where:{
                        email
                    }
                })
                if(!farmer){
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Invalid credentials"})
                }
                const isValidPassword = await validatePassword(password,farmer.passwordHash)
                if(!isValidPassword){
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Invalid credentials"})
                }
                const token = await createToken(farmer.id)
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
            const farmerId = req.farmerId
            if(!farmerId){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"Farmer ID is required"})
            }
            const farmer = await prisma.farmer.findUnique({
                where:{
                    id:farmerId
                }
            })
            if(!farmer){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"Farmer not found"})
            }
            return res.status(HTTPStatus.OK).json({message:"Farmer found",farmer})  
            
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error fetching farmer",error})
        }
    }
}