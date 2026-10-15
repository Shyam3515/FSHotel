import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

/* ---------- Connect DB ---------- */
connectDB();

const app = express();

/* ---------- Core middleware ---------- */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
  }),
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ---------- Rate limiting ---------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    message: "Too many auth attempts, try again later.",
  },
});

/* ---------- Health check ---------- */
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "HOTEL OǴ API is running 🚀" }),
);

/* ---------- Routes ---------- */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payment", paymentRoutes);
/* ---------- Errors ---------- */
app.use(notFound);
app.use(errorHandler);

/* ---------- Start ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  ),
);
