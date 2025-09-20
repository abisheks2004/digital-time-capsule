const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parses JSON payloads

// Routes
const capsuleRoutes = require('./routes/capsules');
app.use('/api/capsules', capsuleRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Check your MONGO_URI, IP whitelist in Atlas, and internet connection.");
    process.exit(1); // stop server if DB not connected
  }
};

connectDB();

// Health check route
app.get('/', (req, res) => res.send('Server is running!'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
