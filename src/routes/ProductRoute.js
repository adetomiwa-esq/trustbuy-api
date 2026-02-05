import express from "express";
import {
  createProduct,
  getProductBySlug,
  getProducts,
} from "../controllers/ProductController.js";

const router = express.Router();

router.route("/products").get(getProducts);
router.route("/products/:slug").get(getProductBySlug);
router.route("/new-product").post(createProduct);

export default router;
