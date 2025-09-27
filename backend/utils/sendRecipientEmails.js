// utils/sendRecipientEmails.js
const sendEmail = require("./sendEmail");
const { relativeFromNow, formatLocal } = require("./time");

function safe(str, fallback = "") {
  return (str ?? "").toString().trim() || fallback;
}

async function sendReceivedEmail({ to, senderName, title, unlockAt, shareLink }) {
  const unlockIn = unlockAt ? relativeFromNow(unlockAt) : null;
  const unlockLocal = unlockAt ? formatLocal(unlockAt) : null;

  const subject = `📦 You’ve received a Time Capsule from ${safe(senderName, "someone")}`;
  const text =
    `Hello!\n\n` +
    `${safe(senderName, "Someone")} sent you a time capsule.\n` +
    `Title: ${safe(title, "Untitled")}\n` +
    (unlockAt
      ? `It unlocks ${unlockIn || "soon"} (${unlockLocal}).\n`
      : `It will unlock soon.\n`) +
    `Link: ${shareLink}`;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#111827;color:#e5e7eb;padding:20px;border-radius:12px">
      <h2 style="margin:0 0 8px;color:#22c55e">You’ve received a Time Capsule!</h2>
      <p style="margin:6px 0"><strong>From:</strong> ${safe(senderName, "Someone")}</p>
      <p style="margin:6px 0"><strong>Title:</strong> ${safe(title, "Untitled")}</p>
      ${
        unlockAt
          ? `<p style="margin:6px 0"><strong>Unlocks:</strong> ${unlockIn || "soon"} <span style="color:#9ca3af">(${unlockLocal})</span></p>`
          : `<p style="margin:6px 0"><strong>Unlocks:</strong> soon</p>`
      }
      <p style="margin:12px 0">Use the button below when it’s unlocked:</p>
      <a href="${shareLink}" target="_blank"
         style="display:inline-block;padding:10px 16px;background:#22c55e;color:#000;text-decoration:none;border-radius:8px;font-weight:700">
        Open Capsule
      </a>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

async function sendUnlockedEmail({ to, senderName, title, shareLink, messagePreview }) {
  const subject = `🔓 Your Time Capsule from ${safe(senderName, "someone")} is unlocked`;
  const text =
    `It’s open now!\n\n` +
    `Title: ${safe(title, "Untitled")}\n` +
    (messagePreview ? `Preview: ${messagePreview.slice(0, 120)}\n` : "") +
    `Open it: ${shareLink}`;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#111827;color:#e5e7eb;padding:20px;border-radius:12px">
      <h2 style="margin:0 0 8px;color:#22c55e">Your Time Capsule is unlocked!</h2>
      <p style="margin:6px 0"><strong>From:</strong> ${safe(senderName, "Someone")}</p>
      <p style="margin:6px 0"><strong>Title:</strong> ${safe(title, "Untitled")}</p>
      ${
        messagePreview
          ? `<p style="margin:12px 0;color:#9ca3af">Preview: ${messagePreview.slice(0, 120)}</p>`
          : ""
      }
      <a href="${shareLink}" target="_blank"
         style="display:inline-block;padding:10px 16px;background:#22c55e;color:#000;text-decoration:none;border-radius:8px;font-weight:700">
        Open Capsule
      </a>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

module.exports = { sendReceivedEmail, sendUnlockedEmail };
