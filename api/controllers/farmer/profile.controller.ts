import prisma from "../../db/prisma";
import { Request,Response } from "express";
import { HTTPStatus } from "../../services/http/status";

export class ProfileController{
    create = async (req:Request,res:Response)=>{
        try {
            const farmerId = req.farmerId;
            if (!farmerId) {
                return res.status(HTTPStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Farmer ID not found in request"
                });
            }

            const { location } = req.body;
            if (!location) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Location is required"
                });
            }

            const profile = await prisma.farmerProfile.create({
                data: {
                    farmerId,
                    trustScore:0,
                    location:location
                }
            });

            return res.status(HTTPStatus.CREATED).json({
                success: true,
                message: "Profile created successfully",
                data: profile
            });
        } catch (error) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to create profile",
                error: (error as Error).message
            });
        }
    }
}