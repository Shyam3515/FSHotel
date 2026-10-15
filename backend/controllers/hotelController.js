import Hotel from "../models/Hotel.js";
import asyncHandler from "../utils/asyncHandler.js";

/* =========================================================
   @route   GET /api/hotels
   @desc    List hotels with filters
   @query   q, location, city, category, minPrice, maxPrice, sort, limit
   @access  Public
   ========================================================= */
export const getHotels = asyncHandler(async (req, res) => {
  const {
    q = "",
    location = "",
    city = "",
    category = "All",
    minPrice,
    maxPrice,
    sort = "recommended",
    limit,
  } = req.query;

  const filter = {};

  if (category && category !== "All") filter.category = category;
  if (city) filter.city = new RegExp(`^${city}$`, "i");

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const search = (q || location || "").trim();
  if (search) {
    const rx = new RegExp(search, "i");
    filter.$or = [{ name: rx }, { city: rx }, { location: rx }, { category: rx }];
  }

  const sortMap = {
    recommended: { featured: -1, rating: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
  };

  let query = Hotel.find(filter).sort(sortMap[sort] || sortMap.recommended);
  if (limit) query = query.limit(Number(limit));

  const hotels = await query.exec();

  res.json({ success: true, count: hotels.length, hotels });
});

/* =========================================================
   @route   GET /api/hotels/destinations
   @desc    Aggregated destinations from hotels
   @access  Public
   ========================================================= */
export const getDestinations = asyncHandler(async (req, res) => {
  const data = await Hotel.aggregate([
    {
      $group: {
        _id: "$city",
        count: { $sum: 1 },
        image: { $first: "$image" },
        minPrice: { $min: "$price" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const destinations = data.map((d) => ({
    name: d._id,
    count: `${d.count} stays`,
    image: d.image,
    minPrice: d.minPrice,
  }));

  res.json({ success: true, count: destinations.length, destinations });
});

/* =========================================================
   @route   GET /api/hotels/:id
   @desc    Single hotel details
   @access  Public
   ========================================================= */
export const getHotelById = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    res.status(404);
    throw new Error("Hotel not found");
  }

  const related = await Hotel.find({
    _id: { $ne: hotel._id },
    category: hotel.category,
  }).limit(3);

  res.json({ success: true, hotel, related });
});

/* =========================================================
   @route   POST /api/hotels
   @desc    Create a hotel
   @access  Private/Admin
   ========================================================= */
export const createHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.create(req.body);
  res.status(201).json({ success: true, hotel });
});

/* =========================================================
   @route   PUT /api/hotels/:id
   @desc    Update a hotel
   @access  Private/Admin
   ========================================================= */
export const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!hotel) {
    res.status(404);
    throw new Error("Hotel not found");
  }

  res.json({ success: true, hotel });
});

/* =========================================================
   @route   DELETE /api/hotels/:id
   @desc    Delete a hotel
   @access  Private/Admin
   ========================================================= */
export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);

  if (!hotel) {
    res.status(404);
    throw new Error("Hotel not found");
  }

  res.json({ success: true, message: "Hotel removed" });
});