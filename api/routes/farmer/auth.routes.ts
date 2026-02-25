import { AuthController } from "../../controllers/farmer/auth.controller";
import { Router } from "express";



export const router = Router()
const authController = new AuthController()

router.post("/register",authController.register)
router.post("/login",authController.login)
router.post("/me",authController.me)

 