// backend/utils/sendEmail.js
import dotenv from "dotenv";
import { Resend } from "resend";
import nodemailer from "nodemailer";

dotenv.config();

// Setup optional SMTP transporter (Gmail or custom SMTP)
let smtpTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  smtpTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export default async function sendEmail({ to, subject, text, html, attachments = [] }) {
  // 1. If SMTP is configured, prefer SMTP (it sends to any recipient domain without restrictions)
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: process.env.MAIL_FROM || `"Digital Time Capsule" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: html || `<p>${text}</p>`,
        attachments,
      });
      console.log(`✅ Email sent via SMTP → ${to}`);
      return info;
    } catch (smtpErr) {
      console.warn(`⚠️ SMTP send failed for ${to} (${smtpErr.message}), falling back to Resend if available...`);
    }
  }

  // 2. Try Resend
  if (resend) {
    const fromAddress = process.env.MAIL_FROM || "Digital Time Capsule <onboarding@resend.dev>";

    // First try with configured MAIL_FROM
    let res = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text,
    });

    // If unverified domain error and MAIL_FROM wasn't onboarding@resend.dev, retry with onboarding@resend.dev
    if (res.error && res.error.message && res.error.message.includes("domain is not verified")) {
      console.warn("⚠️ Domain not verified on Resend, retrying with onboarding@resend.dev...");
      res = await resend.emails.send({
        from: "Digital Time Capsule <onboarding@resend.dev>",
        to,
        subject,
        html: html || `<p>${text}</p>`,
        text,
      });
    }

    if (res.error) {
      console.error(`❌ Resend error for ${to}:`, res.error.message);
      if (res.error.message && res.error.message.includes("only send testing emails to your own email address")) {
        throw new Error(
          `Resend free mode only allows sending to your registered account email. To send to any recipient, verify your domain on Resend or configure Gmail App Password (EMAIL_USER & EMAIL_PASS).`
        );
      }
      throw new Error(res.error.message || "Failed to send email");
    }

    console.log(`✅ Email sent via Resend → ${to}`);
    return res;
  }

  throw new Error("❌ No email provider configured. Please set RESEND_API_KEY or EMAIL_USER & EMAIL_PASS in environment.");
}
