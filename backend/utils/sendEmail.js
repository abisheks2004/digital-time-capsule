// backend/utils/sendEmail.js
import dotenv from "dotenv";
import { Resend } from "resend";
import nodemailer from "nodemailer";

dotenv.config();

// Setup dynamic SMTP transporter (Gmail or custom SMTP)
function getSmtpTransporter() {
  const rawUser = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS;
  if (!rawUser || !rawPass) return null;

  // Clean and sanitize quotes, env key prefixes, and extra spaces
  const user = rawUser.trim().replace(/^EMAIL_USER\s*=\s*/i, "").replace(/^["']|["']$/g, "").trim();
  const pass = rawPass.trim().replace(/^EMAIL_PASS\s*=\s*/i, "").replace(/^["']|["']$/g, "").replace(/\s+/g, "").trim();

  if (!user || !pass) return null;

  return {
    transporter: nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: { user, pass },
    }),
    user,
  };
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export default async function sendEmail({ to, subject, text, html, attachments = [], replyTo }) {
  // 1. If SMTP (Gmail) is configured, prefer SMTP (it sends to ANY recipient domain without restrictions!)
  const smtpConfig = getSmtpTransporter();
  console.log(`[sendEmail] Target: ${to} | Provider: ${smtpConfig ? `Gmail SMTP (${smtpConfig.user})` : (resend ? "Resend" : "None")}`);
  if (smtpConfig) {
    try {
      const info = await smtpConfig.transporter.sendMail({
        from: `"Digital Time Capsule" <${smtpConfig.user}>`,
        to,
        replyTo: replyTo || undefined,
        subject,
        text,
        html: html || `<p>${text}</p>`,
        attachments,
      });
      console.log(`✅ Email sent via Gmail SMTP (${smtpConfig.user}) → ${to}`);
      return info;
    } catch (smtpErr) {
      console.error(`❌ Gmail SMTP error for ${to}:`, smtpErr.message);
      if (!resend) {
        throw new Error(`Email sending error: ${smtpErr.message}`);
      }
      console.warn(`⚠️ Falling back to Resend...`);
    }
  }

  // 2. Try Resend
  if (resend) {
    const fromAddress = process.env.MAIL_FROM?.trim().replace(/^MAIL_FROM\s*=\s*["']?|["']?$/g, "") || "Digital Time Capsule <onboarding@resend.dev>";

    // First try with configured MAIL_FROM
    let res = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text,
      reply_to: replyTo || undefined,
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
        reply_to: replyTo || undefined,
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
