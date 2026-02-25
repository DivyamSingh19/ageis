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
             const existingAdmin = await prisma.admin.findUnique({
                where:{
                    email
                }             
            })
                if(existingAdmin){   
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Admin already exists"})
                }
                const hashedPassword = await hashPassword(password)
                const admin = await prisma.admin.create({
                    data:{
                        
                        email,
                        name
                        password:hashedPassword
                    }
                })
                const token = await createToken(admin.id)
                if(!token){
                    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating token",token, email})
                }
                return res.status(HTTPStatus.CREATED).json({message:"Admin created successfully",token})
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error creating admin",error})
        }
    }
    login = async (req:Request,res:Response) => {
        try {
            const {email,password} = req.body
            if(!email || !password){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"All fields are required"})
             }
                const admin = await prisma.admin.findUnique({
                    where:{
                        email
                    }
                })
                if(!admin){
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Invalid credentials"})
                }
                const isValidPassword = await validatePassword(password,admin.password)
                if(!isValidPassword){
                    return res.status(HTTPStatus.BAD_REQUEST).json({message:"Invalid credentials"})
                }
                const token = await createToken(admin.id)
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
            const adminId = req.adminId
            if(!adminId){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"Admin ID is required"})
            }
            const admin  = await prisma.admin.findUnique({
                where:{ 
                    id:adminId
                }
            })
            if(!admin){
                return res.status(HTTPStatus.BAD_REQUEST).json({message:"Admin not found"})
            }
            return res.status(HTTPStatus.OK).json({message:"Admin found",admin})  
            
        } catch (error) {   
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message:"Error fetching admin",error})
        }
    }
}