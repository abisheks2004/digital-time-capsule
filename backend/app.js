const express = require('express');
const cors = require('cors');
require('dotenv').config();


// Routes
const capsulesRoutes = require('./routes/capsules');
const timecapsulesRoutes = require('./routes/timecapsules');
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);
// Routes
app.use('/api/capsules', capsulesRoutes);          // basic capsules
app.use('/api/timecapsules', timecapsulesRoutes);  // advanced capsules with attachments
app.use("/api/auth", authRoutes);

// Health check
app.get('/', (req, res) => res.send('⏳ Digital Time Capsule API is running!'));

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
