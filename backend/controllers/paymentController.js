
import crypto from "crypto";
import Razorpay from "razorpay";

import Booking from "../models/Booking.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendBookingConfirmationEmail } from "../utils/sendEmail.js";

/* =========================================================
   RAZORPAY CONFIGURATION
========================================================= */

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay configuration missing. Check Render environment variables."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/* =========================================================
   HELPER: LOG PAYMENT ERRORS
========================================================= */

const logPaymentError = (operation, error) => {
  console.error(`❌ Razorpay ${operation} failed:`, {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    description: error.error?.description,
    reason: error.error?.reason,
  });
};

/* =========================================================
   @route   POST /api/payment/create-order
   @desc    Create Razorpay order for a booking
   @access  Private
========================================================= */

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "bookingId is required",
    });
  }

  // Find booking
  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  // Verify booking ownership
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized for this booking",
    });
  }

  // Prevent duplicate payment
  if (booking.paymentStatus === "Paid") {
    return res.status(400).json({
      success: false,
      message: "This booking has already been paid",
    });
  }

  // Validate amount
  const total = Number(booking.total);

  if (!Number.isFinite(total) || total <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking amount",
    });
  }

  const amountInPaise = Math.round(total * 100);

  if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment amount",
    });
  }

  // Create Razorpay order
  let razorpay;
  let order;

  try {
    razorpay = getRazorpay();

    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: String(booking.bookingId).slice(0, 40),
      notes: {
        bookingId: String(booking.bookingId),
        hotelName: String(booking.hotelName || ""),
        userId: req.user._id.toString(),
      },
    });
  } catch (error) {
    logPaymentError("Order Creation", error);

    return res.status(502).json({
      success: false,
      message: "Unable to create Razorpay order. Please try again.",
    });
  }

  // Save Razorpay order ID in MongoDB
  try {
    booking.razorpayOrderId = order.id;
    await booking.save();
  } catch (error) {
    console.error("❌ Failed to save Razorpay order ID:", error.message);

    return res.status(500).json({
      success: false,
      message: "Order was created but could not be saved. Please contact support.",
    });
  }

  console.log("✅ Razorpay order created:", {
    orderId: order.id,
    bookingId: booking.bookingId,
    amount: order.amount,
  });

  // Send order details to frontend
  return res.status(200).json({
    success: true,

    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    },

    keyId: process.env.RAZORPAY_KEY_ID,

    booking: {
      bookingId: booking.bookingId,
      hotelName: booking.hotelName,
      hotelImage: booking.hotelImage,
      checkIn: booking.checkIn
        ? new Date(booking.checkIn).toISOString().split("T")[0]
        : null,
      checkOut: booking.checkOut
        ? new Date(booking.checkOut).toISOString().split("T")[0]
        : null,
      guests: booking.guests,
      roomType: booking.roomType,
      total: booking.total,
    },

    user: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || "",
    },
  });
});

/* =========================================================
   @route   POST /api/payment/verify
   @desc    Verify Razorpay signature and confirm booking
   @access  Private
========================================================= */

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !bookingId
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing payment verification details",
    });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keySecret) {
    console.error("❌ Razorpay secret is missing");

    return res.status(500).json({
      success: false,
      message: "Payment verification is not configured",
    });
  }

  // Find booking
  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  // Verify ownership
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized for this booking",
    });
  }

  // Ensure the order belongs to this booking
  if (booking.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({
      success: false,
      message: "Razorpay order does not match this booking",
    });
  }

  // Verify HMAC signature
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(generatedSignature, "hex");
  const receivedBuffer = Buffer.from(razorpay_signature, "hex");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed. Invalid signature.",
    });
  }

  // Prevent duplicate processing
  if (booking.paymentStatus === "Paid") {
    return res.status(200).json({
      success: true,
      message: "Payment has already been verified",
      booking,
    });
  }

  // Update booking
  booking.paymentStatus = "Paid";
  booking.status = "Confirmed";
  booking.paymentMethod = "Razorpay";
  booking.razorpayPaymentId = razorpay_payment_id;
  booking.razorpaySignature = razorpay_signature;

  await booking.save();

  console.log("✅ Payment verified successfully:", {
    bookingId: booking.bookingId,
    paymentId: razorpay_payment_id,
  });

  // Send confirmation email without delaying the response
  sendBookingConfirmationEmail(
    req.user.email,
    req.user.name,
    booking
  ).catch((error) => {
    console.error("❌ Booking confirmation email failed:", error.message);
  });

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    booking,
  });
});

/* =========================================================
   @route   GET /api/payment/key
   @desc    Return public Razorpay key ID
   @access  Private
========================================================= */

export const getRazorpayKey = asyncHandler(async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();

  if (!keyId) {
    return res.status(500).json({
      success: false,
      message: "Razorpay key is not configured",
    });
  }

  return res.status(200).json({
    success: true,
    keyId,
  });
});
