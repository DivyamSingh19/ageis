import { Router } from "express";
import { ProductController } from "../../controllers/farmer/product.controller";
import { upload } from "../../config/multer";

const router = Router();
const controller = new ProductController();

router.post("/", upload.array("images", 5), controller.create);
router.put("/:id", upload.array("images", 5), controller.update);
router.delete("/:id", controller.delete);
router.get("/:id", controller.getById);
router.get("/", controller.all);

export default router;