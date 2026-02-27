import { Router } from "express";
import { NFCController } from "../../controllers/user/nfc.controller";

export const router = Router()
const nfcController = new NFCController()

router.post("/verify", nfcController.verify)