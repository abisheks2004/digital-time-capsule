import cron from "node-cron";
import Capsule from "../models/Capsule.js";
import sendEmail from "../utils/sendEmail.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://digital-time-capsule-five.vercel.app";
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "*/1 * * * *";

let isRunning = false;

const safeEmail = (v) => (typeof v === "string" ? v.trim() : "");

export function startNotificationCron() {
  cron.schedule(CRON_SCHEDULE, async () => {
    if (isRunning) return;
    isRunning = true;

    const now = new Date();
    let sent = 0;
    let skipped = 0;

    try {
      // Get candidates that reached their unlock date and have not been notified
      const toNotify = await Capsule.find({
        notified: { $ne: true },
        unlockDate: { $lte: now },
      })
        .select("_id title message recipientEmail userEmail shareLink unlockDate")
        .lean();

      if (!toNotify.length) {
        isRunning = false;
        return;
      }

      const ops = [];

      for (const cap of toNotify) {
        // Collect emails: notify recipient if provided, and creator if different
        const recipients = new Set(
          [safeEmail(cap.recipientEmail), safeEmail(cap.userEmail)].filter(Boolean)
        );

        if (!recipients.size) {
          skipped++;
          continue;
        }

        const fromName = cap.userEmail || "Someone";
        const link = `${FRONTEND_URL}/capsule/share/${cap.shareLink || cap._id}`;

        for (const to of recipients) {
          try {
            await sendEmail({
              to,
              subject: `🔓 Time Capsule Unlocked: ${cap.title || "Your Time Capsule"}`,
              text:
                `Your Digital Time Capsule is open now!\n\n` +
                `Title: ${cap.title || "Untitled"}\n` +
                `From: ${fromName}\n` +
                (cap.message ? `Message Preview: ${cap.message.slice(0, 120)}\n\n` : "\n") +
                `Open and view it here: ${link}`,
              html: `
                <div style="font-family: Arial, sans-serif; color:#e5e7eb; background:#0b1120; padding:24px; border-radius:16px; max-width:560px; margin:0 auto; border:1px solid rgba(251,191,36,0.2);">
                  <div style="font-size:32px; margin-bottom:8px;">⏳🔓</div>
                  <h2 style="color:#fbbf24; margin:0 0 10px; font-size:22px;">Your Digital Time Capsule is Unlocked!</h2>
                  <p style="margin:6px 0; color:#94a3b8; font-size:14px;"><strong>From:</strong> ${fromName}</p>
                  <p style="margin:6px 0; color:#94a3b8; font-size:14px;"><strong>Title:</strong> ${cap.title || "Untitled Capsule"}</p>
                  ${cap.message ? `<div style="background:rgba(15,23,42,0.8); padding:12px 16px; border-radius:10px; margin:14px 0; color:#e2e8f0; font-size:14px; border-left:3px solid #fbbf24;">${cap.message.slice(0, 200)}...</div>` : ""}
                  <div style="margin-top:20px;">
                    <a href="${link}" target="_blank"
                       style="display:inline-block; padding:12px 22px; background:linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color:#030712; text-decoration:none; border-radius:12px; font-weight:800; font-size:15px;">
                      Open Full Capsule →
                    </a>
                  </div>
                </div>
              `,
            });
            sent++;
          } catch (e) {
            console.error("❌ sendEmail failed:", cap._id, "->", to, e.message);
          }
        }

        ops.push({
          updateOne: {
            filter: { _id: cap._id, notified: { $ne: true } },
            update: {
              $set: { notified: true, notifiedAt: new Date(), notifyNote: "sent" },
            },
          },
        });
      }

      if (ops.length) await Capsule.bulkWrite(ops);
      console.log(`📧 Cron: sent=${sent}, skipped=${skipped}, total=${toNotify.length}`);
    } catch (err) {
      console.error("Cron job error:", err);
    } finally {
      isRunning = false;
    }
  });
}
