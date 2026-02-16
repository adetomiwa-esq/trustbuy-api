import { configDotenv } from "dotenv";
import express from "express";
import productRoutes from "./src/routes/ProductRoute.js";
import authRoutes from "./src/routes/AuthRoute.js";
import connectDB from "./src/config/db.js";

configDotenv();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", productRoutes);
app.use("api/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`listening on PORT: ${process.env.PORT}`);
});
