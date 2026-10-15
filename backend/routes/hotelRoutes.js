import express from "express";
import {
  getHotels,
  getDestinations,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Static routes MUST come before "/:id" */
router.get("/destinations", getDestinations);

router.route("/")
  .get(getHotels)
  .post(protect, adminOnly, createHotel);

router.route("/:id")
  .get(getHotelById)
  .put(protect, adminOnly, updateHotel)
  .delete(protect, adminOnly, deleteHotel);

export default router;