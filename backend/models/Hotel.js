import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Hotel name is required"], trim: true },
    city: { type: String, required: [true, "City is required"], trim: true, index: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    category: { type: String, required: true, trim: true, index: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    description: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

hotelSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

hotelSchema.index({ name: "text", city: "text", location: "text" });

export default mongoose.model("Hotel", hotelSchema);