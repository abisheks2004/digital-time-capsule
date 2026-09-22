// backend/utils/sendEmail.js
import dotenv from "dotenv";
import { Resend } from "resend";
import nodemailer from "nodemailer";

dotenv.config();

// Setup dynamic SMTP transporter (Gmail or custom SMTP)
function getSmtpTransporter() {
  const rawUser = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.MAIL_USER || process.env.SMTP_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.MAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  if (!rawUser || !rawPass) return null;

  // Clean and sanitize quotes, env key prefixes, and extra spaces
  const user = rawUser.trim().replace(/^[A-Z_]+\s*=\s*/i, "").replace(/^["']|["']$/g, "").trim();
  const pass = rawPass.trim().replace(/^[A-Z_]+\s*=\s*/i, "").replace(/^["']|["']$/g, "").replace(/\s+/g, "").trim();

  if (!user || !pass) return null;

  return {
    transporter: nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: { user, pass },
      connectionTimeout: 10000, // 10s timeout to connect
      greetingTimeout: 10000,
      socketTimeout: 15000, // 15s socket timeout
    }),
    user,
  };
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export default async function sendEmail({ to, subject, text, html, attachments = [], replyTo }) {
  // 1. If Brevo HTTP API is configured, prefer Brevo (runs over HTTPS Port 443, never blocked by Render, sends to any recipient worldwide!)
  const brevoKey = (process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY)?.trim();
  if (brevoKey) {
    const senderEmail = process.env.EMAIL_USER?.trim() || "abisheka067@gmail.com";
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Digital Time Capsule", email: senderEmail },
          to: [{ email: to }],
          replyTo: replyTo ? { email: replyTo } : undefined,
          subject,
          htmlContent: html || `<p>${text}</p>`,
          textContent: text,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }
      console.log(`✅ Email sent via Brevo HTTP API → ${to}`);
      return data;
    } catch (brevoErr) {
      console.error(`❌ Brevo API error for ${to}:`, brevoErr.message);
      throw new Error(`Email sending error (Brevo): ${brevoErr.message}`);
    }
  }

  // 2. If SMTP (Gmail) is configured and reachable
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
      // If Render blocked SMTP with timeout and Resend is available, fall back to Resend
      if (resend) {
        console.warn(`⚠️ SMTP blocked by host firewall (${smtpErr.message}), falling back to Resend...`);
      } else {
        throw new Error(`Gmail SMTP error: ${smtpErr.message}. Note: Render free tier blocks outbound SMTP ports 465/587.`);
      }
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
