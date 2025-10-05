// sendEmail.js
import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail({ to, subject, text, html, attachments = [] }) {
  try {
    const from = process.env.MAIL_FROM || "Digital Time Capsule <onboarding@resend.dev>";

    const response = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html: html || (text ? `<p>${String(text).replace(/\n/g, "<br/>")}</p>` : undefined),
      attachments, // Resend supports Buffer/File attachments
    });

    console.log("✅ Email sent via Resend:", response.id, "->", to);
    return response;
  } catch (error) {
    console.error("❌ Email send failed via Resend:", error.message);
    console.error("📩 Error details:", error);
    return null;
  }
}
