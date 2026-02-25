import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js";
import streamifier from "streamifier";

// /**
//  * @desc   Get single product
//  * @route  GET /api/new-product/
//  * @access Amin
//  */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "trust-buy-products" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    }

    uploadedImages.push({
      public_id: result.public_id,
      url: result.secure_url,
    });

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      images: uploadedImages,
      createdBy: req.user._id,
    });

    // const product = await Product.create(req.body);
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

// /**
//  * @desc   Delete product
//  * @route  DELETE /api/delete/:slug
//  * @access Private
//  */

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Product deletion failed" });
  }
};

// /**
//  * @desc   Delete product
//  * @route  DELETE /api/update/:slug
//  * @access Private
//  */

export const updateProduct = async (req, res) => {
  try {
    const { name, description, stock, price, removedImages } = req.body;
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    if (removedImages && removedImages.length > 0) {
      for (const image of removedImages) {
        await cloudinary.uploader.destroy(image);
      }

      product.images = product.images.filter(
        (image) => !removedImages.include(image.public_id),
      );
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      }
      product.images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;

    await product.save();

    res.json(product);
  } catch {
    res.status(500).json({ message: "Product update failed" });
  }
};
