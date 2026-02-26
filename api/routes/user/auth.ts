import { AuthController } from "../../controllers/user/auth.controller";
import { OnboardingController } from "../../controllers/user/onboarding.controller";
import { Router } from "express";

export const router = Router()
const authController = new AuthController()
const onboardingController = new OnboardingController()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/me", authController.me)
router.post("/onboarding/complete", onboardingController.complete)