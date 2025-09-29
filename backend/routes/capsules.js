import express from "express";
import crypto from "crypto";
import Capsule from "../models/Capsule.js";
import auth from "../middleware/auth.js";
import sendCapsuleEmail from "../utils/sendCapsuleEmail.js";

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "https://digital-time-capsule-five.vercel.app";

const isEmail = (e) => /^\S+@\S+\.\S+$/.test(String(e || "").trim());
const toLocal = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleString();
};
const parseUnlockDate = (val) => {
  if (!val) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(val));
  if (m) {
    const [_, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0, 0);
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

// CREATE capsule (emails recipient only)
router.post("/", auth, async (req, res) => {
  try {
    const { message, unlockDate, shared, attachments, recipientEmail, title } = req.body;

    if (!message || !unlockDate) {
      return res.status(400).json({ error: "Message and unlockDate are required" });
    }

    const parsedUnlock = parseUnlockDate(unlockDate);
    if (!parsedUnlock) return res.status(400).json({ error: "Invalid unlockDate" });
    if (recipientEmail && !isEmail(recipientEmail)) {
      return res.status(400).json({ error: "Invalid recipientEmail" });
    }

    if (recipientEmail && req.user?.email &&
        recipientEmail.trim().toLowerCase() === req.user.email.toLowerCase()) {
      console.warn("Recipient equals sender; skipping immediate email.");
    }

    const shareToken = crypto.randomBytes(10).toString("hex") + "-" + Date.now().toString(36);

    const capsule = new Capsule({
      user: req.user.id,
      userEmail: req.user.email,
      recipientEmail: recipientEmail?.trim() || "",
      title: title || "Time Capsule",
      message,
      unlockDate: parsedUnlock,
      shared: !!shared,
      attachments: attachments || [],
      shareLink: shareToken,
      notified: false,
    });

    await capsule.save();

    if (recipientEmail &&
        recipientEmail.trim().toLowerCase() !== (req.user.email || "").toLowerCase()) {
      const shareLink = `${FRONTEND_URL}/capsule/share/${capsule.shareLink || capsule._id}`;
      const fromName = req.user?.name || req.user?.email || "Someone";
      const displayUnlock = toLocal(parsedUnlock);

      sendCapsuleEmail(
        recipientEmail.trim(),
        title || "Time Capsule",
        displayUnlock,
        shareLink,
        Array.isArray(attachments) ? attachments : [],
        fromName
      ).catch((e) => console.error("Immediate recipient email failed:", e.message));
    }

    res.status(201).json({ success: true, capsule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all capsules of logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const capsules = await Capsule.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, capsules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET capsule by shareLink (public access)
router.get("/share/:link", async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ shareLink: req.params.link });
    if (!capsule) return res.status(404).json({ error: "Capsule not found" });

    const isUnlocked = new Date(capsule.unlockDate) <= new Date();
    res.json({ ...capsule.toObject(), isUnlocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE capsule (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ error: "Capsule not found" });
    if (capsule.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { message, unlockDate, shared, attachments, recipientEmail, title } = req.body;

    if (message) capsule.message = message;
    if (title) capsule.title = title;
    if (unlockDate) {
      const parsed = parseUnlockDate(unlockDate);
      if (!parsed) return res.status(400).json({ error: "Invalid unlockDate" });
      capsule.unlockDate = parsed;
      capsule.notified = false;
    }
    if (shared !== undefined) capsule.shared = !!shared;
    if (attachments) capsule.attachments = attachments;
    if (recipientEmail !== undefined) {
      if (recipientEmail && !isEmail(recipientEmail)) {
        return res.status(400).json({ error: "Invalid recipientEmail" });
      }
      capsule.recipientEmail = recipientEmail?.trim() || "";
    }

    await capsule.save();
    res.json({ success: true, capsule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE capsule (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ error: "Capsule not found" });
    if (capsule.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await capsule.deleteOne();
    res.json({ success: true, message: "Capsule deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
