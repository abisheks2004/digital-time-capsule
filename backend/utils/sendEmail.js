import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
});

// Verify SMTP at boot
(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP ready");
  } catch (e) {
    console.error("❌ SMTP verify failed:", e.message);
  }
})();

export default async function sendEmail({ to, subject, text, html, attachments = [] }) {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || `"Digital Time Capsule" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: html || (text ? `<p>${String(text).replace(/\n/g, "<br/>")}</p>` : undefined),
    attachments,
  });
  console.log("✅ Email sent:", info.messageId, "->", to);
  return info;
}
