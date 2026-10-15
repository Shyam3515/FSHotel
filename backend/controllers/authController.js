import crypto from "crypto";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateToken from "../utils/generateToken.js";
import generateOtp from "../utils/generateOtp.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendOtpEmail, sendWelcomeEmail } from "../utils/sendEmail.js";

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

/* =========================================================
   @route   POST /api/auth/send-otp
   @desc    Step 1 of signup — validate + send OTP email
   @access  Public
   ========================================================= */
export const sendSignupOtp = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const emailLower = email.toLowerCase().trim();

  const existing = await User.findOne({ email: emailLower });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Remove any pending OTP for this email
  await Otp.deleteMany({ email: emailLower });

  await Otp.create({
    email: emailLower,
    otp,
    expiresAt,
    payload: {
      name: name.trim(),
      email: emailLower,
      password, // hashed later by User pre-save hook
      phone: phone || "",
    },
  });

  try {
    await sendOtpEmail(emailLower, name.trim(), otp);
  } catch (err) {
    console.error("❌ OTP email failed:", err.message);
    await Otp.deleteMany({ email: emailLower });
    res.status(500);
    throw new Error(
      "Could not send OTP email. Check your Gmail app password in .env"
    );
  }

  res.json({
    success: true,
    message: "OTP sent to your email. It expires in 10 minutes.",
    email: emailLower,
  });
});

/* =========================================================
   @route   POST /api/auth/verify-otp
   @desc    Step 2 of signup — verify OTP + create account
   @access  Public
   ========================================================= */
export const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const emailLower = email.toLowerCase().trim();
  const record = await Otp.findOne({ email: emailLower });

  if (!record) {
    res.status(400);
    throw new Error("No pending OTP found. Please request a new one.");
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    res.status(400);
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (record.attempts >= 5) {
    await Otp.deleteOne({ _id: record._id });
    res.status(400);
    throw new Error("Too many failed attempts. Please request a new OTP.");
  }

  if (record.otp !== String(otp).trim()) {
    record.attempts += 1;
    await record.save();
    res.status(400);
    throw new Error(`Invalid OTP. ${5 - record.attempts} attempts left.`);
  }

  /* ---------- Create user ---------- */
  const { name, password, phone } = record.payload;

  const user = await User.create({
    name,
    email: emailLower,
    password, // hashed by User pre-save hook
    phone: phone || "",
  });

  await Otp.deleteOne({ _id: record._id });

  /* ---------- Welcome email (non-blocking) ---------- */
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error("Welcome email failed:", err.message)
  );

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: userPayload(user),
  });
});

/* =========================================================
   Keep these existing endpoints: login, getMe, updateProfile,
   forgotPassword, resetPassword (unchanged)
   ========================================================= */

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  res.json({
    success: true,
    token: generateToken(user._id),
    user: userPayload(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: userPayload(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email.toLowerCase();
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = req.body.password;
  }
  const updated = await user.save();
  res.json({ success: true, user: userPayload(updated) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user) {
    return res.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  res.json({
    success: true,
    message: "If that email exists, a reset link has been sent.",
    resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Reset token is invalid or has expired");
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({
    success: true,
    token: generateToken(user._id),
    user: userPayload(user),
  });
});