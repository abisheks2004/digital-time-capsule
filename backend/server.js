import cors from "cors";
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const { startNotificationCron } = require("./notifications/cron");
const { startReminderCron } = require("./notifications/reminders");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/timecapsule";

// Optional: ensure a consistent timezone for server-side scheduling
process.env.TZ = process.env.TZ || "UTC";

// Mongoose config
mongoose.set("strictQuery", true);

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Check MONGO_URI, IP whitelist, and network.");
    process.exit(1);
  }
}

// Guards to avoid double-starting crons in certain run modes
global.__CRONS_STARTED = global.__CRONS_STARTED || false;

(async () => {
  // Global safety nets
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });

  await connectDB();

  // Start crons AFTER DB is ready (only once)
  if (!global.__CRONS_STARTED) {
    try {
      startNotificationCron();
      console.log("⏰ Notification cron started");
      startReminderCron();
      console.log("🔔 Reminder cron started");
      global.__CRONS_STARTED = true;
    } catch (e) {
      console.error("❌ Failed to start crons:", e.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    try {
      await mongoose.connection.close();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
})();


app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
  credentials: true
}));