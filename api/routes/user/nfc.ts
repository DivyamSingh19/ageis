import { Request,Response } from "express";
import { NFCController } from "../../controllers/user/nfc.controller";

const nfcController = new NFCController()

export const nfcRoutes = (req:Request,res:Response) => {
    nfcController.verify(req,res)
}