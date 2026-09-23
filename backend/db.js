import mongoose from "mongoose";

let isConnected = false;

export default async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/timecapsule";
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
}
