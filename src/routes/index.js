import express from "express";
import authRoutes from "./auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fashion Store API is running",
  });
});

export default router;
