import { Router } from "express";
import { KeyController } from "../controllers/key.controller";

const router = Router();
const keyController = new KeyController();

 
router.post("/new", keyController.createKeyPair);

 
router.get("/:publicKey", keyController.getKeys);

 
router.get("/:publicKey/public", keyController.getPublicKey);

 
router.put("/:publicKey/rotate", keyController.rotateKeys);

router.delete("/:publicKey", keyController.deleteKeys);

export default router;