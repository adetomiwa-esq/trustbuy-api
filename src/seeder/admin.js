import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/user.model.js";

if (
  !process.env.MONGO_URI ||
  !process.env.SUPER_ADMIN_EMAIL ||
  !process.env.SUPER_ADMIN_PASSWORD
) {
  throw new Error(
    "Set MONGO_URI, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD before seeding the super admin.",
  );
}

await mongoose.connect(process.env.MONGO_URI);
const email = process.env.SUPER_ADMIN_EMAIL.toLowerCase().trim();
const existing = await User.findOne({ email });
if (existing) {
  existing.role = "SUPER_ADMIN";
  existing.isActive = true;
  existing.isDeleted = false;
  await existing.save();
  console.log("Existing account promoted to SUPER_ADMIN");
} else {
  await User.create({
    firstName: process.env.SUPER_ADMIN_FIRST_NAME || "Store",
    lastName: process.env.SUPER_ADMIN_LAST_NAME || "Owner",
    email,
    phone: process.env.SUPER_ADMIN_PHONE || "0000000000",
    password: process.env.SUPER_ADMIN_PASSWORD,
    role: "SUPER_ADMIN",
  });
  console.log("SUPER_ADMIN account created");
}
await mongoose.disconnect();
