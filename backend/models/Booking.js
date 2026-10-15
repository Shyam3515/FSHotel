import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },

    hotelName: { type: String, required: true },
    hotelImage: { type: String, default: "" },
    hotelLocation: { type: String, default: "" },

    bookingId: { type: String, required: true, unique: true, index: true },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },

    guests: { type: Number, default: 2, min: 1 },
    roomType: { type: String, default: "Deluxe Room" },

    pricePerNight: { type: Number, required: true },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentMethod: { type: String, default: "" },

    /* ---------- Razorpay fields ---------- */
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (doc.checkIn) ret.checkIn = doc.checkIn.toISOString().split("T")[0];
    if (doc.checkOut) ret.checkOut = doc.checkOut.toISOString().split("T")[0];
    return ret;
  },
});

export default mongoose.model("Booking", bookingSchema);