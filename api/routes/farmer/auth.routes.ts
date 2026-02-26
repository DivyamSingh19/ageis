import { AuthController } from "../../controllers/farmer/auth.controller";
import { OnboardingController } from "../../controllers/farmer/onboarding.controller";
import { Router } from "express";



export const router = Router()
const authController = new AuthController()
const onboardingController = new OnboardingController()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/me", authController.me)
router.post("/onboarding/complete", onboardingController.complete)
