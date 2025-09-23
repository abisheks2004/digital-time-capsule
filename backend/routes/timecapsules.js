// backend/routes/timecapsules.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Capsule = require("../models/Capsule");

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------------------- CREATE CAPSULE --------------------
router.post("/", upload.array("attachments"), async (req, res) => {
  try {
    const { message, unlockDate, userEmail } = req.body;

    if (!message || !unlockDate || !userEmail) {
      return res.status(400).json({ error: "Message, unlockDate, and userEmail are required" });
    }

    // Convert uploaded files to base64 attachments
    const attachments = req.files?.map((file) => ({
      fileName: file.originalname,
      fileType: file.mimetype.split("/")[0], // image/video/audio
      fileUrl: file.buffer.toString("base64"),
    })) || [];

    // Generate simple share link token
    const shareLink = Math.random().toString(36).substring(2, 12);

    const capsule = new Capsule({
      message,
      unlockDate: new Date(unlockDate),
      userEmail,
      attachments,
      shareLink,
    });

    await capsule.save();

    res.status(201).json({ success: true, capsule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------- GET ALL CAPSULES --------------------
router.get("/", async (req, res) => {
  try {
    const capsules = await Capsule.find().sort({ createdAt: -1 });
    res.json({ success: true, capsules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------- UPDATE CAPSULE --------------------
router.put("/:id", upload.array("attachments"), async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ error: "Capsule not found" });

    const { message, unlockDate, userEmail } = req.body;

    if (!message && !unlockDate && !userEmail && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: "Provide at least one field or attachment to update" });
    }

    // Update fields if provided
    if (message) capsule.message = message;
    if (unlockDate) capsule.unlockDate = new Date(unlockDate);
    if (userEmail) capsule.userEmail = userEmail;

    if (req.files?.length > 0) {
      capsule.attachments = req.files.map((file) => ({
        fileName: file.originalname,
        fileType: file.mimetype.split("/")[0],
        fileUrl: file.buffer.toString("base64"),
      }));
    }

    await capsule.save();
    res.json({ success: true, capsule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------- DELETE CAPSULE --------------------
router.delete("/:id", async (req, res) => {
  try {
    const capsule = await Capsule.findByIdAndDelete(req.params.id);
    if (!capsule) return res.status(404).json({ error: "Capsule not found" });

    res.json({ success: true, message: "Capsule deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all shared capsules for logged-in user
router.get("/shared", auth, async (req, res) => {
  try {
    const capsules = await Capsule.find({ shared: true }); // or your shared logic
    res.json(capsules);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shared capsules" });
  }
});

module.exports = router;
