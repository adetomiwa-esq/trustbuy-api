import express from "express";
import authRoutes from "../features/auth/auth.routes.js";
import productRoutes from "./ProductRoute.js";
import cartRoutes from "../features/cart/cart.routes.js";
import orderRoutes from "../features/orders/order.routes.js";
import categoryRoutes from "../features/categories/category.routes.js";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.get("/health", (_req, res) =>
  res.status(200).json({ success: true, message: "Trust Buy API is running" }),
);
export default router;
