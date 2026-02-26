import { Router } from "express";
import { KeyController } from "../controllers/user.key.controller";

const keyRouter = Router();
const keyController = new KeyController();

 
keyRouter.post("/user/new", keyController.createKeyPair);

 
keyRouter.get("/user/:publicKey", keyController.getKeys);

 
keyRouter.get("/user/:publicKey/public", keyController.getPublicKey);

 
keyRouter.put("/user/:publicKey/rotate", keyController.rotateKeys);

keyRouter.delete("/user/:publicKey", keyController.deleteKeys);

export default keyRouter;