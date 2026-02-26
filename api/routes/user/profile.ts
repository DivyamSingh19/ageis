import { UserProfileController } from "../../controllers/user/profile.controller";
import { Router } from "express";

export const router = Router()
const profileController = new UserProfileController()

router.post("/", profileController.create)
router.get("/", profileController.get)
router.put("/", profileController.edit)
