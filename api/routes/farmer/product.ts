import { Router } from "express";
import { ProductController } from "../../controllers/farmer/product.controller";
import { upload } from "../../config/multer";
import { farmerAuth } from "../../middlewares/farmer";

const productRouter = Router();
const controller = new ProductController();

productRouter.post("/", farmerAuth, upload.array("files", 5), controller.create);
productRouter.put("/:id", farmerAuth, upload.array("files", 5), controller.update);
productRouter.delete("/:id", farmerAuth, controller.delete);
productRouter.get("/:id/nft", controller.getNftInfo);
productRouter.get("/:id", controller.getById);
productRouter.get("/", farmerAuth, controller.all);
productRouter.get("/all", controller.all);
productRouter.get("/discover", controller.discover);

export default productRouter;