import { OrderController } from "../../controllers/user/order.controller";
import { Router } from "express";

export const router = Router();
const orderController = new OrderController();

router.post("/create", orderController.create);
router.get("/", orderController.get);
router.post("/cancel", orderController.cancel);
