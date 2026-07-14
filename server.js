import { configDotenv } from "dotenv";
import express from "express";
import productRoutes from "./src/routes/ProductRoute.js";
import authRoutes from "./src/features/auth/auth.routes.js";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import { csrfProtection } from "./src/middleware/csrfMiddleware.js";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import routes from "./src/routes/index.js";
import errorHandler from "./src/middleware/errorHandler.js";

configDotenv();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api/v1", routes);
// app.use("/api", productRoutes);
// app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`listening on PORT: ${PORT}`);
  });
};

startServer();
