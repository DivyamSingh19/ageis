import { verifyProductWithGemini } from "../../controllers/farmer/verify.product.controller";
import express from "express";

const router = express.Router();

router.post("/verify-product", verifyProductWithGemini);


export default router;