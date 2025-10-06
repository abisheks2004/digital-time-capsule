// backend/utils/sendEmail.js
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail({ to, subject, text, html }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("❌ Missing RESEND_API_KEY in environment");
  }

  try {
    const response = await resend.emails.send({
      from: process.env.MAIL_FROM || "Digital Time Capsule <onboarding@resend.dev>",
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text,
    });

    console.log(`✅ Email sent successfully → ${to}`);
    return response;
  } catch (error) {
    console.error(`❌ Resend API error for ${to}:`, error.message);
    throw error;
  }
}
