import { Router } from "express";
import { KeyController } from "../controllers/key.controller";

const keyRouter = Router();
const keyController = new KeyController();

 
keyRouter.post("/new", keyController.createKeyPair);

 
keyRouter.get("/:publicKey", keyController.getKeys);

 
keyRouter.get("/:publicKey/public", keyController.getPublicKey);

 
keyRouter.put("/:publicKey/rotate", keyController.rotateKeys);

keyRouter.delete("/:publicKey", keyController.deleteKeys);

export default keyRouter;