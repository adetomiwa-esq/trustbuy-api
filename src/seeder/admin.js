import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const hashedPassword = await bcrypt.hash("AdminPassword123", 12);

await User.create({
  name: "Admin",
  email: "admin@trustbuy.com",
  password: hashedPassword,
  role: "admin",
});

console.log("Admin created");
process.exit();
