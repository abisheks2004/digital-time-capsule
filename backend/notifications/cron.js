// notifications/cron.js
const cron = require("node-cron");
const Capsule = require("../models/Capsule");
const sendEmail = require("../utils/sendEmail");

cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    const capsules = await Capsule.find({
      unlockDate: { $lte: now },
      notified: false,
      userEmail: { $exists: true, $ne: "" },
    });

    for (const cap of capsules) {
      await sendEmail(
        cap.userEmail,
        "Your Capsule is Unlocked! 🔓",
        `Hi! Your capsule is now unlocked.\n\nMessage: ${cap.message}\n\nOpen it here: ${process.env.FRONTEND_URL || "http://localhost:5173"}/capsules/share/${cap._id}`
      );

      cap.notified = true;
      await cap.save();
    }
  } catch (err) {
    console.error("Cron job error:", err);
  }
});
