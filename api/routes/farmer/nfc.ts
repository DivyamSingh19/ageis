import { Router } from "express";
import { NFCController } from "../../controllers/farmer/nfc.controller";
import { farmerAuth } from "../../middlewares/farmer";

export const router = Router();
const nfcController = new NFCController();

router.post("/mount", farmerAuth, nfcController.mount);
