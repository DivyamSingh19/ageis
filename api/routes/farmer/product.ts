import { Router } from "express";
import { ProductController } from "../../controllers/farmer/product.controller";
import { upload } from "../../config/multer";

const productRouter = Router();
const controller = new ProductController();

productRouter.post("/", upload.array("files", 5), controller.create);
productRouter.put("/:id", upload.array("files", 5), controller.update);
productRouter.delete("/:id", controller.delete);
productRouter.get("/:id/nft", controller.getNftInfo);
productRouter.get("/:id", controller.getById);
productRouter.get("/", controller.all);

export default productRouter;