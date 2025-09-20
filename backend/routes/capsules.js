const express = require('express');
const router = express.Router();
const multer = require('multer');
const Capsule = require('../models/Capsule');

// Configure multer storage
const storage = multer.memoryStorage(); // keeps files in memory as Buffer
const upload = multer({ storage });

// POST route to create capsule with attachments
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    const { message, unlockDate, unlockTime } = req.body;

    if (!message || !unlockDate) {
      return res.status(400).json({ error: 'Message and unlock date are required' });
    }

    // Convert uploaded files into attachment objects
    const attachments = req.files.map(file => ({
      fileName: file.originalname,
      fileType: file.mimetype.startsWith('image')
        ? 'image'
        : file.mimetype.startsWith('video')
        ? 'video'
        : file.mimetype.startsWith('audio')
        ? 'audio'
        : 'link',
      fileUrl: file.buffer.toString('base64'), // store small files as Base64
    }));

    // Combine date + time if provided
    const unlockDateTime = unlockTime
      ? new Date(`${unlockDate}T${unlockTime}`)
      : new Date(unlockDate);

    const shareLink = Math.random().toString(36).substring(2, 12); // generate token

    const capsule = new Capsule({
      message,
      unlockDate: unlockDateTime,
      shareLink,
      attachments,
    });

    await capsule.save();
    res.status(201).json({ success: true, shareLink: capsule.shareLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET all capsules
router.get('/', async (req, res) => {
  try {
    const capsules = await Capsule.find().sort({ createdAt: -1 });
    res.json(capsules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE capsule by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Capsule.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Capsule not found' });
    }

    res.status(200).json({ success: true, message: 'Capsule deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
