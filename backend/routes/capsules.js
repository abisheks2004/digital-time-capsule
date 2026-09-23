import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Capsule from "../models/Capsule.js";
import auth from "../middleware/auth.js";
import sendCapsuleEmail from "../utils/sendCapsuleEmail.js";

const getFrontendUrl = (req) => {
  const origin = req?.headers?.origin || req?.headers?.referer;
  if (origin) {
    try {
      const url = new URL(origin);
      return `${url.protocol}//${url.host}`;
    } catch {}
  }
  return process.env.FRONTEND_URL || "https://digital-time-capsule-blush.vercel.app";
};

// Email validation
const isEmail = (e) => /^\S+@\S+\.\S+$/.test(String(e || "").trim());

// Parse unlockDate consistently
const parseUnlockDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

// CREATE capsule
router.post("/", auth, async (req, res) => {
  try {
    const { message, unlockDate, shared, attachments, recipientEmail, title } = req.body;

    if (!message || !unlockDate) return res.status(400).json({ error: "Message and unlockDate required" });

    const parsedUnlock = parseUnlockDate(unlockDate);
    if (!parsedUnlock) return res.status(400).json({ error: "Invalid unlockDate" });

    // Ensure unlockDate is in the future
    if (parsedUnlock.getTime() <= Date.now()) {
      return res.status(400).json({ error: "Unlock date and time must be in the future" });
    }

    if (recipientEmail && !isEmail(recipientEmail)) return res.status(400).json({ error: "Invalid recipientEmail" });

    const shareToken = crypto.randomBytes(10).toString("hex") + "-" + Date.now().toString(36);

    const capsule = new Capsule({
      user: req.user.id,
      userEmail: req.user.email,
      recipientEmail: recipientEmail?.trim() || "",
      title: title?.trim() || "Time Capsule",
      message,
      unlockDate: parsedUnlock, // store as UTC
      shared: shared !== undefined ? !!shared : true,
      attachments: attachments || [],
      shareLink: shareToken,
      notified: false,
    });

    await capsule.save();

    const shareUrl = `${getFrontendUrl(req)}/capsule/share/${capsule.shareLink}`;

    // Send confirmation to recipient email whenever provided
    if (recipientEmail && isEmail(recipientEmail)) {
      sendCapsuleEmail(
        recipientEmail.trim(),
        capsule.title,
        parsedUnlock.toISOString(),
        shareUrl,
        Array.isArray(attachments) ? attachments : [],
        req.user.name ? `${req.user.name} (${req.user.email})` : req.user.email,
        req.user.email
      ).catch((e) => console.error("Recipient email failed:", e.message));
    }

    res.status(201).json({ success: true, capsule, shareUrl });
  } catch (err) {
    console.error("Error creating capsule:", err);
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

// GET capsule by shareLink or _id (accessible once unlocked via unique link)
router.get("/share/:link", async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.link);
    const capsule = await Capsule.findOne({
      $or: [
        { shareLink: req.params.link },
        ...(isObjectId ? [{ _id: req.params.link }] : []),
      ],
    });
    if (!capsule) return res.status(404).json({ error: "Capsule not found" });

    const isUnlocked = new Date(capsule.unlockDate).getTime() <= Date.now();
    
    // If still locked, return capsule metadata (title, unlockDate) but keep secret message & attachments sealed
    const safeCapsule = capsule.toObject ? capsule.toObject() : { ...capsule._doc };
    if (!isUnlocked) {
      safeCapsule.message = "";
      safeCapsule.attachments = [];
      safeCapsule.isLocked = true;
    } else {
      safeCapsule.isLocked = false;
    }

    res.json({ success: true, capsule: safeCapsule, isUnlocked });
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
    if (capsule.user.toString() !== req.user.id) return res.status(403).json({ error: "Not authorized" });

    const { message, unlockDate, shared, attachments, recipientEmail, title } = req.body;

    if (message) capsule.message = message;
    if (title) capsule.title = title.trim();
    if (unlockDate) {
      const parsed = parseUnlockDate(unlockDate);
      if (!parsed) return res.status(400).json({ error: "Invalid unlockDate" });
      capsule.unlockDate = parsed;
      capsule.notified = false;
    }
    if (shared !== undefined) capsule.shared = !!shared;
    if (attachments) capsule.attachments = attachments;
    if (recipientEmail !== undefined) {
      if (recipientEmail && !isEmail(recipientEmail)) return res.status(400).json({ error: "Invalid recipientEmail" });
      capsule.recipientEmail = recipientEmail?.trim() || "";
    }

    await capsule.save();

    const shareUrl = `${getFrontendUrl(req)}/capsule/share/${capsule.shareLink || capsule._id}`;

    res.status(200).json({ success: true, capsule, shareUrl });
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
    if (capsule.user.toString() !== req.user.id) return res.status(403).json({ error: "Not authorized" });

    await capsule.deleteOne();
    res.json({ success: true, message: "Capsule deleted" });
  } catch (err) {
    console.error("Delete capsule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// SEND / RESEND to recipient
router.post("/:id/send", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ error: "Capsule not found" });
    if (capsule.user.toString() !== req.user.id) return res.status(403).json({ error: "Not authorized" });

    const recipient = capsule.recipientEmail?.trim();
    if (!recipient || !isEmail(recipient)) {
      return res.status(400).json({ error: "No valid recipient email set on this capsule" });
    }

    const shareUrl = `${getFrontendUrl(req)}/capsule/share/${capsule.shareLink || capsule._id}`;

    const senderEmail = capsule.userEmail || req.user?.email || "someone";
    const senderName = req.user?.name ? `${req.user.name} (${senderEmail})` : senderEmail;

    await sendCapsuleEmail(
      recipient,
      capsule.title || "Time Capsule",
      capsule.unlockDate ? capsule.unlockDate.toISOString() : new Date().toISOString(),
      shareUrl,
      capsule.attachments || [],
      senderName,
      senderEmail
    );

    res.json({ success: true, message: `Capsule link successfully sent to ${recipient}!` });
  } catch (err) {
    console.error("Manual send error:", err);
    res.status(400).json({ error: err.message || "Failed to send email" });
  }
});

export default router;
