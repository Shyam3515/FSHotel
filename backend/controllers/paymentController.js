import crypto from "crypto";
import Razorpay from "razorpay";
import Booking from "../models/Booking.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendBookingConfirmationEmail } from "../utils/sendEmail.js";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in .env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/* =========================================================
   @route   POST /api/payment/create-order
   @desc    Create a Razorpay order for a booking
   @access  Private
   ========================================================= */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    res.status(400);
    throw new Error("bookingId is required");
  }

  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized for this booking");
  }

  if (booking.paymentStatus === "Paid") {
    res.status(400);
    throw new Error("This booking has already been paid");
  }

  const razorpay = getRazorpay();
  const amountInPaise = Math.round(booking.total * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: booking.bookingId,
    notes: {
      bookingId: booking.bookingId,
      hotelName: booking.hotelName,
      userId: req.user._id.toString(),
    },
  });

  booking.razorpayOrderId = order.id;
  await booking.save();

  res.json({
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
      checkIn: booking.checkIn.toISOString().split("T")[0],
      checkOut: booking.checkOut.toISOString().split("T")[0],
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
   @desc    Verify Razorpay signature + confirm booking
   @access  Private
   ========================================================= */
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Missing Razorpay verification fields");
  }

  /* ---------- Verify HMAC signature ---------- */
  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed — invalid signature");
  }

  /* ---------- Update booking ---------- */
  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  booking.paymentStatus = "Paid";
  booking.status = "Confirmed";
  booking.paymentMethod = "Razorpay";
  booking.razorpayOrderId = razorpay_order_id;
  booking.razorpayPaymentId = razorpay_payment_id;
  booking.razorpaySignature = razorpay_signature;
  await booking.save();

  /* ---------- Send booking confirmation email ---------- */
  sendBookingConfirmationEmail(req.user.email, req.user.name, booking).catch(
    (err) => console.error("Booking email failed:", err.message)
  );

  res.json({ success: true, booking });
});

/* =========================================================
   @route   GET /api/payment/key
   @desc    Expose Razorpay public key to frontend (optional)
   @access  Private
   ========================================================= */
export const getRazorpayKey = asyncHandler(async (req, res) => {
  res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID });
});