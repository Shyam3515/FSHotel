import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import generateBookingId from "../utils/generateBookingId.js";
import asyncHandler from "../utils/asyncHandler.js";

/* =========================================================
   @route   POST /api/bookings
   @desc    Create a booking (status: Pending)
   @access  Private
   ========================================================= */
export const createBooking = asyncHandler(async (req, res) => {
  const { hotelId, checkIn, checkOut, guests, roomType } = req.body;

  if (!hotelId || !checkIn || !checkOut) {
    res.status(400);
    throw new Error("hotelId, checkIn and checkOut are required");
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    res.status(404);
    throw new Error("Hotel not found");
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    res.status(400);
    throw new Error("Invalid check-in / check-out dates");
  }

  if (outDate <= inDate) {
    res.status(400);
    throw new Error("Check-out date must be after check-in date");
  }

  const nights = Math.max(1, Math.ceil((outDate - inDate) / 86400000));
  const total = nights * hotel.price;

  const booking = await Booking.create({
    user: req.user._id,
    hotel: hotel._id,
    hotelName: hotel.name,
    hotelImage: hotel.image,
    hotelLocation: hotel.location,
    bookingId: generateBookingId(),
    checkIn: inDate,
    checkOut: outDate,
    nights,
    guests: Number(guests) || 2,
    roomType: roomType || "Deluxe Room",
    pricePerNight: hotel.price,
    total,
    status: "Pending",
    paymentStatus: "Pending",
  });

  res.status(201).json({ success: true, booking });
});

/* =========================================================
   @route   GET /api/bookings/my
   @desc    Logged-in user's bookings
   @access  Private
   ========================================================= */
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({ success: true, count: bookings.length, bookings });
});

/* =========================================================
   @route   GET /api/bookings/:id
   @desc    Single booking (owner or admin)
   @access  Private
   ========================================================= */
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Accept either Mongo _id or the human bookingId
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { bookingId: id };

  const booking = await Booking.findOne(query);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const isOwner = booking.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this booking");
  }

  res.json({ success: true, booking });
});

/* =========================================================
   @route   PUT /api/bookings/:id/pay
   @desc    Mark booking as paid & confirmed
   @access  Private
   ========================================================= */
export const payBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { bookingId: id };
  const booking = await Booking.findOne(query);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (booking.paymentStatus === "Paid") {
    res.status(400);
    throw new Error("This booking has already been paid");
  }

  booking.paymentStatus = "Paid";
  booking.status = "Confirmed";
  booking.paymentMethod = req.body?.paymentMethod || "Card";
  await booking.save();

  res.json({ success: true, booking });
});

/* =========================================================
   @route   PUT /api/bookings/:id/cancel
   @desc    Cancel a booking
   @access  Private
   ========================================================= */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { bookingId: id };
  const booking = await Booking.findOne(query);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  booking.status = "Cancelled";
  await booking.save();

  res.json({ success: true, booking });
});