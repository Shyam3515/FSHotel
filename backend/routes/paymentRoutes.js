
import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/key", protect, getRazorpayKey);

router.post("/create-order", protect, createRazorpayOrder);

router.post("/verify", protect, verifyRazorpayPayment);

export default router;
