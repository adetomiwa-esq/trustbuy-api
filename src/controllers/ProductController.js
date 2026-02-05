import Product from "../models/Product.js";

// /**
//  * @desc   Get single product
//  * @route  GET /api/new-product/
//  * @access Amin
//  */
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// /**
//  * @desc   Get all products
//  * @route  GET /api/products/
//  * @access Public
//  */

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// /**
//  * @desc   Get single product
//  * @route  GET /api/products/:slug
//  * @access Public
//  */

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = Product.find(req.params.slug);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product slug" });
  }
};
