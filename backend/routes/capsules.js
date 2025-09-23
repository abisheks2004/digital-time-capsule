const express = require('express');
const router = express.Router();
const Capsule = require('../models/Capsule');

// CREATE capsule
router.post('/', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is missing' });
    }

    const { message, unlockDate, userEmail } = req.body;
    if (!message || !unlockDate || !userEmail) {
      return res.status(400).json({ error: 'Message, unlockDate, and email required' });
    }

    const capsule = new Capsule({ message, unlockDate: new Date(unlockDate), userEmail });
    await capsule.save();
    res.status(201).json({ success: true, capsule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET all capsules
router.get('/', async (req, res) => {
  try {
    const capsules = await Capsule.find().sort({ createdAt: -1 });
    res.json({ success: true, capsules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE capsule
router.put('/:id', async (req, res) => {
  try {
    const { message, unlockDate, userEmail } = req.body;

    if (!message && !unlockDate && !userEmail) {
      return res.status(400).json({ error: 'At least one field required to update' });
    }

    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

    if (new Date(capsule.unlockDate) <= new Date()) {
      return res.status(400).json({ error: 'Cannot edit an unlocked capsule' });
    }

    if (message) capsule.message = message;
    if (unlockDate) capsule.unlockDate = new Date(unlockDate);
    if (userEmail) capsule.userEmail = userEmail;

    await capsule.save();
    res.json({ success: true, capsule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE capsule
router.delete('/:id', async (req, res) => {
  try {
    const capsule = await Capsule.findByIdAndDelete(req.params.id);
    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

    res.json({ success: true, message: 'Capsule deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
