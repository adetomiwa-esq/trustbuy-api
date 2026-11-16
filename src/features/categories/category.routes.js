import express from "express";
import { protect, allowRoles } from "../../middleware/protect.js";
import { createCategory, getCategories } from "./category.controller.js";
const router = express.Router();
router.get("/", getCategories);
router.post("/", protect, allowRoles("SUPER_ADMIN"), createCategory);
export default router;
