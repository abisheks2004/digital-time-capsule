import express from "express";
import Capsule from "../models/Capsule.js";
import authMiddleware from "../middleware/auth.js"; // ESM import

const router = express.Router();

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

// PUT toggle shared for a capsule (owner only)
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

export default router;
