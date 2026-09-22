// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import nodemailer from "nodemailer";

// Routes
import capsulesRoutes from "./routes/capsules.js";
import sharedCapsulesRouter from "./routes/sharedCapsules.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "https://digital-time-capsule-five.vercel.app",
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email diagnostic endpoint
app.get("/api/email-health", async (req, res) => {
  const rawUser = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.MAIL_USER || process.env.SMTP_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.MAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const hasResend = !!process.env.RESEND_API_KEY;

  const userClean = rawUser ? rawUser.trim().replace(/^[A-Z_]+\s*=\s*/i, "").replace(/^["']|["']$/g, "").trim() : null;
  const passClean = rawPass ? rawPass.trim().replace(/^[A-Z_]+\s*=\s*/i, "").replace(/^["']|["']$/g, "").replace(/\s+/g, "").trim() : null;

  let smtpStatus = "not_configured";
  let smtpError = null;

  if (userClean && passClean) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: userClean, pass: passClean },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });
      await transporter.verify();
      smtpStatus = "connected";
    } catch (err) {
      smtpStatus = "failed";
      smtpError = err.message;
    }
  }

  res.json({
    emailUserConfigured: !!userClean,
    emailUserMasked: userClean ? `${userClean.slice(0, 3)}***@${userClean.split("@")[1] || ""}` : null,
    emailPassConfigured: !!passClean,
    emailPassLength: passClean ? passClean.length : 0,
    resendConfigured: hasResend,
    smtpStatus,
    smtpError,
  });
});

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
