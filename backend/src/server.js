import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { seedAdminIfMissing } from "./controllers/authController.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "pharmacy-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    await seedAdminIfMissing();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend", error);
    process.exit(1);
  }
};

start();
