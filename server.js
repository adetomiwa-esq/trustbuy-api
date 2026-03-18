import { configDotenv } from "dotenv";
import express from "express";
import productRoutes from "./src/routes/ProductRoute.js";
import authRoutes from "./src/routes/AuthRoute.js";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import { csrfProtection } from "./src/middleware/csrfMiddleware.js";
import cors from "cors";

configDotenv();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api", productRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`listening on PORT: ${PORT}`);
});
