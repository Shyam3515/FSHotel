import express from "express";
import {
  sendSignupOtp,
  verifySignupOtp,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Signup (2-step) */
router.post("/send-otp", sendSignupOtp);
router.post("/verify-otp", verifySignupOtp);

/* Auth */
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

/* Protected */
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;