import sendEmail from "./sendEmail.js";
import { relativeFromNow, formatLocal } from "./time.js";

export default async function sendCapsuleEmail(
  recipientEmail,
  capsuleTitle,
  unlockDate,  // Date or string
  shareLink,
  attachments = [],
  fromName = "Someone"
) {
  const unlockIn = unlockDate ? relativeFromNow(unlockDate) : null;
  const unlockLocal = unlockDate ? formatLocal(unlockDate) : null;

  const subject = `📦 You've received a Digital Time Capsule: ${capsuleTitle || "Untitled"}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color:#e5e7eb; background:#111827; padding:20px; border-radius:12px;">
      <h2 style="color:#22c55e; margin:0 0 8px;">You've been sent a Digital Time Capsule!</h2>
      <p style="margin:6px 0;"><strong>From:</strong> ${fromName || "Someone"}</p>
      <p style="margin:6px 0;"><strong>Title:</strong> ${capsuleTitle || "Untitled"}</p>
      <p style="margin:6px 0;">
        <strong>Unlocks:</strong>
        ${unlockIn ? `${unlockIn} <span style="color:#9ca3af">(${unlockLocal})</span>` : "—"}
      </p>
      <p style="margin:12px 0;">Click below to view your capsule once it’s unlocked:</p>
      <a href="${shareLink}" target="_blank"
         style="display:inline-block; padding:10px 16px; background:#22c55e; color:#000; text-decoration:none; border-radius:8px; font-weight:700;">
        Open Capsule
      </a>
      <p style="margin-top:16px; color:#9ca3af;">⏳ We’ll remind you again as the unlock time gets closer.</p>
    </div>
  `;

  const text =
    `You've been sent a Digital Time Capsule!\n` +
    `From: ${fromName || "Someone"}\n` +
    `Title: ${capsuleTitle || "Untitled"}\n` +
    `Unlocks: ${unlockIn ? `${unlockIn} (${unlockLocal})` : "—"}\n` +
    `Link: ${shareLink}`;

  return sendEmail({
    to: recipientEmail,
    subject,
    text,
    html,
    attachments,
  });
}

try {
  await sendCapsuleEmail(
    recipientEmail.trim(),
    title || "Time Capsule",
    parsedUnlock.toISOString(),
    shareUrl,
    attachments,
    req.user.name || req.user.email
  );
  console.log("📧 Recipient email sent to", recipientEmail);
} catch (e) {
  console.error("❌ Recipient email failed:", e.message);
}
