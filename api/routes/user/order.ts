import { OrderController } from "../../controllers/user/order.controller";
import { Router } from "express";
import { userAuth } from "../../middlewares/user";

export const router = Router();
const orderController = new OrderController();

router.post("/create", userAuth, orderController.create);
router.get("/", userAuth, orderController.get);
router.post("/cancel", userAuth, orderController.cancel);
