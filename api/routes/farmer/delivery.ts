import { Router } from "express";
import { DeliveryController } from "../../controllers/farmer/delivery.controller";
import { farmerAuth } from "../../middlewares/farmer";

const deliveryRouter = Router();
const controller = new DeliveryController();

// Basic delivery management
deliveryRouter.post("/initialize", farmerAuth, controller.initialize);
deliveryRouter.get("/get", farmerAuth, controller.get);
deliveryRouter.post("/update-status", farmerAuth, controller.updateStatus);
deliveryRouter.get("/orders", farmerAuth, controller.getOrders);
deliveryRouter.get("/orders/:id", farmerAuth, controller.getOrderById);

// NFC operations
deliveryRouter.post("/nfc/associate", farmerAuth, controller.associateNFC);
deliveryRouter.get("/nfc/:nfcId", controller.getOrderByNFC);

export default deliveryRouter;
