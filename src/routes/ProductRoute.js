import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/ProductController.js";
import { protect, allowRoles } from "../middleware/protect.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.post(
  "/",
  protect,
  allowRoles("SUPER_ADMIN"),
  upload.array("images", 8),
  createProduct,
);
router.patch(
  "/:slug",
  protect,
  allowRoles("SUPER_ADMIN"),
  upload.array("images", 8),
  updateProduct,
);
router.delete("/:slug", protect, allowRoles("SUPER_ADMIN"), deleteProduct);
export default router;
