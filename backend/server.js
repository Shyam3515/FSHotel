
import "dotenv/config";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

import { testEmailConnection } from "./utils/sendEmail.js";

/* ---------- Create Express App ---------- */

const app = express();

/* ---------- CORS Configuration ---------- */

// Add your deployed frontend URLs here.
const allowedOrigins = [
  "https://hotelog.netlify.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

/* ---------- Core Middleware ---------- */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------- Logging ---------- */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ---------- General API Rate Limiting ---------- */

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

/* ---------- Authentication Rate Limiting ---------- */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

/* ---------- Health Check ---------- */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HOTEL OG API is running 🚀",
    environment: process.env.NODE_ENV || "development",
  });
});

/* ---------- API Routes ---------- */

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payment", paymentRoutes);

/* ---------- Error Handling ---------- */

app.use(notFound);
app.use(errorHandler);

/* ---------- Connect Database ---------- */

connectDB();

/* ---------- Start Server ---------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 HOTEL OG server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );

  // Test Gmail SMTP connection.
  // The function should handle its own errors.
  testEmailConnection();
});
