import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./db.js";
import { startNotificationCron } from "./notifications/cron.js";
import { startReminderCron } from "./notifications/reminders.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Optional: ensure a consistent timezone for server-side scheduling
process.env.TZ = process.env.TZ || "UTC";

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

  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to DB at startup:", err.message);
  }

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
