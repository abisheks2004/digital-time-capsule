// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Routes
import capsulesRoutes from "./routes/capsules.js";
import sharedCapsulesRouter from "./routes/sharedCapsules.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://digital-time-capsule-five.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/capsules", capsulesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shared-capsules", sharedCapsulesRouter);

// Health check
app.get("/", (req, res) => res.send("⏳ Digital Time Capsule API is running!"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
