// notifications/reminders.js
const cron = require("node-cron");
const Capsule = require("../models/Capsule");
const sendEmail = require("../utils/sendEmail");
const { nextReminderStage, relativeFromNow, formatLocal } = require("../utils/time");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const CRON_SCHEDULE = process.env.CRON_REMINDERS || "*/1 * * * *"; // every minute
let running = false;

function startReminderCron() {
  cron.schedule(CRON_SCHEDULE, async () => {
    if (running) return;
    running = true;

    try {
      // Upcoming capsules with recipient and not yet unlocked
      const now = new Date();
      const items = await Capsule.find({
        recipientEmail: { $exists: true, $type: "string", $ne: "" },
        unlockDate: { $gt: now },
      })
        .select("_id title message userEmail recipientEmail unlockDate shareLink remindersSent")
        .lean();

      if (!items.length) {
        running = false;
        return;
      }

      const ops = [];
      let sent = 0;

      for (const cap of items) {
        const sentSet = new Set(Array.isArray(cap.remindersSent) ? cap.remindersSent : []);
        const stage = nextReminderStage(cap.unlockDate, sentSet);
        if (!stage) continue;

        const to = cap.recipientEmail.trim();
        const fromName = cap.userEmail || "Someone";
        const link = `${FRONTEND_URL}/capsule/share/${cap.shareLink || cap._id}`;

        const unlockIn = relativeFromNow(cap.unlockDate);
        const unlockAt = formatLocal(cap.unlockDate);

        try {
          await sendEmail({
            to,
            subject: `⏳ Your Time Capsule unlocks ${unlockIn}`,
            text:
              `From: ${fromName}\n` +
              `Title: ${cap.title || "Untitled"}\n` +
              `Unlocks ${unlockIn} (${unlockAt})\n` +
              `Link: ${link}`,
            html: `
              <div style="font-family:Arial,sans-serif;background:#111827;color:#e5e7eb;padding:20px;border-radius:12px">
                <h2 style="color:#22c55e;margin:0 0 8px;">Your Time Capsule unlocks ${unlockIn}</h2>
                <p style="margin:6px 0"><strong>From:</strong> ${fromName}</p>
                <p style="margin:6px 0"><strong>Title:</strong> ${cap.title || "Untitled"}</p>
                <p style="margin:6px 0"><strong>Unlock time:</strong> ${unlockAt}</p>
                <a href="${link}" target="_blank"
                  style="display:inline-block;padding:10px 16px;background:#22c55e;color:#000;text-decoration:none;border-radius:8px;font-weight:700">
                  Open Capsule
                </a>
                <p style="margin-top:12px;color:#9ca3af">Stage: ${stage}</p>
              </div>
            `,
          });

          sent++;
          sentSet.add(stage);
          ops.push({
            updateOne: {
              filter: { _id: cap._id },
              update: { $set: { remindersSent: Array.from(sentSet) } },
            },
          });
        } catch (e) {
          console.error("Reminder email failed:", cap._id, "->", to, e.message);
        }
      }

      if (ops.length) await Capsule.bulkWrite(ops);
      if (sent) console.log(`🔔 Reminders sent: ${sent}`);
    } catch (e) {
      console.error("Reminder cron error:", e);
    } finally {
      running = false;
    }
  });
}

module.exports = { startReminderCron };
