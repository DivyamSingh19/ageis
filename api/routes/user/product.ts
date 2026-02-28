import { Router } from "express";
import { ProductController } from "../../controllers/farmer/product.controller";

const router = Router();
const controller = new ProductController();

router.get("/", controller.discover);
router.get("/:id", controller.getById);
router.get("/:id/nft", controller.getNftInfo);

export default router;
