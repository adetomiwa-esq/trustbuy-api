import express from "express";
import { protect, allowRoles } from "../../middleware/protect.js";
import { createOrder, getMyOrders, getOrderById } from "./order.controller.js";
const router = express.Router();
router.use(protect);
router.post("/", createOrder);
router.get("/mine", getMyOrders);
router.get("/:orderId", getOrderById);
export default router;
