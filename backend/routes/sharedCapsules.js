// routes/sharedCapsules.js
const express = require("express");
const router = express.Router();
const Capsule = require("../models/Capsule");
const authMiddleware = require("../middleware/auth"); // your JWT auth

// GET all shared capsules
router.get("/", async (req, res) => {
  try {
    const sharedCapsules = await Capsule.find({ shared: true }).sort({ createdAt: -1 });
    res.json({ sharedCapsules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT toggle shared for a capsule
router.put("/:id/toggle-share", authMiddleware, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    capsule.shared = !capsule.shared;
    await capsule.save();

    res.json({ message: "Share status updated", capsule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
