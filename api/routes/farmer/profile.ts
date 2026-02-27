import { Router } from "express";
 
import {
  createFarmerProfile,
  getFarmerProfile,
  updateFarmerProfile,
  updateTrustScore,
  updateRating,
  deleteFarmerProfile,
} from "../../controllers/farmer/profile.controller"; // adjust path
import {upload} from "../../config/multer"
const router = Router();

router.post("/create", upload.single("certificate"), createFarmerProfile);
router.get("/get", getFarmerProfile);
router.put("/update", upload.single("certificate"), updateFarmerProfile);
router.patch("/trust-score", updateTrustScore);
router.patch("/rating", updateRating);
router.delete("/delete", deleteFarmerProfile);

export default router;