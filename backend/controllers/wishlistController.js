import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import asyncHandler from "../utils/asyncHandler.js";

/* =========================================================
   @route   GET /api/wishlist
   @desc    Get logged-in user's wishlist
   @access  Private
   ========================================================= */
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  const hotels = (user.wishlist || []).filter(Boolean);

  res.json({
    success: true,
    count: hotels.length,
    ids: hotels.map((h) => h.id),
    hotels,
  });
});

/* =========================================================
   @route   POST /api/wishlist/:hotelId
   @desc    Toggle a hotel in/out of the wishlist
   @access  Private
   ========================================================= */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    res.status(404);
    throw new Error("Hotel not found");
  }

  const user = await User.findById(req.user._id);

  const exists = user.wishlist.some((id) => id.toString() === hotelId);

  if (exists) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== hotelId);
  } else {
    user.wishlist.push(hotel._id);
  }

  await user.save();
  await user.populate("wishlist");

  const hotels = user.wishlist.filter(Boolean);

  res.json({
    success: true,
    wished: !exists,
    ids: hotels.map((h) => h.id),
    hotels,
  });
});

/* =========================================================
   @route   DELETE /api/wishlist
   @desc    Clear wishlist
   @access  Private
   ========================================================= */
export const clearWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = [];
  await user.save();

  res.json({ success: true, ids: [], hotels: [] });
});