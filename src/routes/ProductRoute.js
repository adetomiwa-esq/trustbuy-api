import express from "express";
import {
  createProduct,
  getProductBySlug,
  getProducts,
} from "../controllers/ProductController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/products").get(getProducts);
router.route("/products/:slug").get(getProductBySlug);
router
  .route("/new-product")
  .post(protect, adminOnly, upload.array("images", 5), createProduct);

export default router;
