import Category from "../../models/category.model.js";

export const getCategories = async (_req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).select("name slug image description parent");
    res.json({ success: true, categories });
  } catch (e) { next(e); }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, image = "", description = "", parent = null } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Category name is required" });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const category = await Category.create({ name: name.trim(), slug, image, description, parent });
    res.status(201).json({ success: true, category });
  } catch (e) { next(e); }
};
