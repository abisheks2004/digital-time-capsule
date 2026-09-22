// backend/utils/sendEmail.js
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * Creates SMTP transporters for Gmail / custom SMTP.
 * Configured with family: 4 (force IPv4) to avoid Linux IPv6 routing drops in cloud containers.
 */
function getSmtpCredentials() {
  const rawUser = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.MAIL_USER || process.env.SMTP_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.MAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  if (!rawUser || !rawPass) return null;

  const user = rawUser.trim().replace(/^[A-Z_]+\s*=\s*/i, "").replace(/^["']|["']$/g, "").trim();
  const pass = rawPass.trim().replace(/^[A-Z_]+\s*=\s*/i, "").replace(/^["']|["']$/g, "").replace(/\s+/g, "").trim();

  if (!user || !pass) return null;
  return { user, pass };
}

/**
 * Creates a Nodemailer transporter.
 * Tries port 465 (SSL) or port 587 (STARTTLS) with IPv4 forced.
 */
function createTransporter(creds, port = 465) {
  const isSecure = port === 465;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure: isSecure,
    auth: {
      user: creds.user,
      pass: creds.pass,
    },
    family: 4, // Force IPv4 (prevents cloud container IPv6 routing timeouts)
    connectionTimeout: 12000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export default async function sendEmail({ to, subject, text, html, attachments = [], replyTo }) {
  const creds = getSmtpCredentials();
  if (!creds) {
    throw new Error(
      "❌ SMTP is not configured. Please set EMAIL_USER (your Gmail) and EMAIL_PASS (your 16-character App Password) in Render Environment Variables."
    );
  }

  const mailOptions = {
    from: `"Digital Time Capsule" <${creds.user}>`,
    to,
    replyTo: replyTo || undefined,
    subject,
    text,
    html: html || `<p>${text}</p>`,
    attachments,
  };

  // Attempt 1: Try Port 465 (SSL + IPv4)
  try {
    const transporter465 = createTransporter(creds, 465);
    const info = await transporter465.sendMail(mailOptions);
    console.log(`✅ Email sent via Gmail SMTP (port 465) → ${to}`);
    return info;
  } catch (err465) {
    console.warn(`⚠️ Port 465 failed (${err465.message}), attempting Port 587 (STARTTLS)...`);

    // Attempt 2: Try Port 587 (STARTTLS + IPv4)
    try {
      const transporter587 = createTransporter(creds, 587);
      const info = await transporter587.sendMail(mailOptions);
      console.log(`✅ Email sent via Gmail SMTP (port 587) → ${to}`);
      return info;
    } catch (err587) {
      console.error(`❌ Gmail SMTP failed on both ports 465 and 587:`, err587.message);
      throw new Error(`Gmail SMTP delivery failed: ${err587.message || err465.message}`);
    }
  }
}
