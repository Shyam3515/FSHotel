import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
      console.log(`📦 Database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if cluster unreachable
    });

    console.log(`🚀 Atlas cluster ready: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error(
      "👉 Check: password correct? IP whitelisted? cluster still active?"
    );
    process.exit(1);
  }
};

export default connectDB;