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
      // Get candidates (don’t assume recipientEmail exists; we’ll filter safely)
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
        const to = safeEmail(cap.recipientEmail);

        if (!to) {
          skipped++;
          continue;
        }

        const fromName = cap.userEmail || "Someone";
        const link = `${FRONTEND_URL}/capsule/share/${cap.shareLink || cap._id}`;

        try {
          await sendEmail({
            to,
            subject: `🔓 Your Time Capsule from ${fromName} is unlocked`,
            text:
              `It's open now!\n\n` +
              `Title: ${cap.title || "Untitled"}\n` +
              (cap.message ? `Preview: ${cap.message.slice(0, 120)}\n` : "") +
              `Open it: ${link}`,
          });

          sent++;
          ops.push({
            updateOne: {
              filter: { _id: cap._id, notified: { $ne: true } },
              update: {
                $set: { notified: true, notifiedAt: new Date(), notifyNote: "sent" },
              },
            },
          });
        } catch (e) {
          console.error("❌ sendEmail failed:", cap._id, "->", to, e.message);
        }
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
