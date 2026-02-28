import { Router } from "express";
import { OrderController } from "../../controllers/farmer/order.controller";
import { farmerAuth } from "../../middlewares/farmer";

const orderRouter = Router();
const controller = new OrderController();

orderRouter.get("/", farmerAuth, controller.get);
orderRouter.get("/:id", farmerAuth, controller.getById);
orderRouter.post("/cancel", farmerAuth, controller.cancelOrder);

export default orderRouter;
