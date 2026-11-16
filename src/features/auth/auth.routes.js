import express from "express";
import { login, logout, me, refresh, register } from "./auth.controller.js";
import { protect } from "../../middleware/protect.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);
export default router;
