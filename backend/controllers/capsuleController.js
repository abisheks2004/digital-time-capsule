// backend/controllers/capsuleController.js
const Capsule = require('../models/Capsule');
const { v4: uuidv4 } = require('uuid');

exports.createCapsule = async (req, res) => {
  const { message, attachments, unlockDate } = req.body;
  const newCapsule = new Capsule({
    message,
    attachments,
    unlockDate,
    shareLink: uuidv4(),
  });

  try {
    await newCapsule.save();
    res.status(201).json(newCapsule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSharedCapsule = async (req, res) => {
  const { token } = req.params;
  const capsule = await Capsule.findOne({ shareLink: token });

  if (!capsule) return res.status(404).json({ message: "Capsule not found." });

  if (capsule.unlockDate > new Date()) {
    return res.json({ message: `Locked until ${capsule.unlockDate}` });
  }

  res.json({
    message: capsule.message,
    attachments: capsule.attachments,
  });
};
