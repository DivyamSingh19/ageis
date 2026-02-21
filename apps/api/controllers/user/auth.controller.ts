import { Request,Response } from "express"
import { HTTPStatus } from "../../services/http/status"
import prisma from "@repo/db"
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
             const existingUser = await prisma.user.findUnique({
                where:{
                    email
                }             
            })
                if(existingUser){   
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"User already exists"})
                }
                const hashedPassword = await hashPassword(password)
                const user = await prisma.user.create({
                    data:{
                        name,
                        email,
                        password:hashedPassword
                    }
                })
                const token = await createToken(user.id)
                if(!token){
                    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating token",token, email})
                }
                return res.status(HTTPStatus.CREATED).json({message:"User created successfully",token})
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating user",error})
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
                const isValidPassword = await validatePassword(password,farmer.password)
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
            const userId = req.userId
            if(!userId){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"User ID is required"})
            }
            const user = await prisma.user.findUnique({
                where:{
                    id:userId
                }
            })
            if(!user){

                return res.status(HTTPStatus.BAD_REQUEST).json({message:"User not found"})
            }
            return res.status(HTTPStatus.OK).json({message:"User found",user})  
            
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error fetching user",error})
        }
    }
}