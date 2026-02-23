import { Request,Response } from "express"
import prisma from "@repo/db"
import { ProductService } from "../../services/products/main"



export class ProductController {
    private productService:ProductService
    constructor(){
        this.productService = new ProductService()
    }
  add = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        
    }
  }   
  edit = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        
    }
  }
  all = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        
    }
  }
  id = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        
    }
  }
}