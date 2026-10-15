import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import { hotels } from "../data/hotels.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    /* ---------- Clear ---------- */
    await Hotel.deleteMany();
    await Booking.deleteMany();
    await User.deleteMany({ email: { $ne: "admin@hotelog.com" } });

    /* ---------- Hotels ---------- */
    const inserted = await Hotel.insertMany(hotels);
    console.log(`✅ Seeded ${inserted.length} hotels`);

    /* ---------- Admin user ---------- */
    const adminExists = await User.findOne({ email: "admin@hotelog.com" });
    if (!adminExists) {
      await User.create({
        name: "Hotel OǴ Admin",
        email: "admin@hotelog.com",
        password: "admin123", // hashed automatically
        role: "admin",
      });
      console.log("✅ Admin created → admin@hotelog.com / admin123");
    }

    /* ---------- Demo user ---------- */
    const demoExists = await User.findOne({ email: "demo@hotelog.com" });
    if (!demoExists) {
      await User.create({
        name: "Demo User",
        email: "demo@hotelog.com",
        password: "demo123",
      });
      console.log("✅ Demo user created → demo@hotelog.com / demo123");
    }

    await mongoose.connection.close();
    console.log("🌱 Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

run();
