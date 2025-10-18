import dotenv from "dotenv";
import sendEmail from "./utils/sendEmail.js";

dotenv.config();

(async () => {
  try {
    console.log("📨 Testing email sending via Resend...");

    const result = await sendEmail({
      to: "abisheka067@gmail.com", // 👈 change to your real email
      subject: "✅ Digital Time Capsule Email Test",
      text: "This is a plain text test message from your backend setup.",
      html: `
        <div style="font-family:Arial,sans-serif;background:#111827;color:#e5e7eb;padding:20px;border-radius:12px">
          <h2 style="color:#22c55e">Digital Time Capsule Email Test</h2>
          <p>Your backend email system using Resend is working correctly 🚀</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully →", result);
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
  }
})();
