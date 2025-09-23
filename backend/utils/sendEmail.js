const nodemailer = require("nodemailer");
const sendCapsuleEmail = require('../utils/sendCapsuleEmail');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html = null, attachments = []) => {
  try {
    await transporter.sendMail({
      from: `"Digital Time Capsule" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
      attachments,
    });
    console.log("✅ Email sent to", to);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

module.exports = sendEmail;
