const mongoose = require('mongoose');

// Attachment schema for multiple media types
const AttachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },   // could be local path or cloud URL
  fileType: { 
    type: String, 
    enum: ['image', 'video', 'audio', 'link'], // only allowed types
    required: true
  },
});

// Main Capsule schema
const CapsuleSchema = new mongoose.Schema({
  message: { type: String, required: true },
  attachments: [AttachmentSchema],  // optional, can store multiple files
  unlockDate: { type: Date, required: true },
  shareLink: { type: String, unique: true, required: true }, // token
  createdAt: { type: Date, default: Date.now },
});

// Optional: automatically generate shareLink if not provided
CapsuleSchema.pre('validate', function(next) {
  if (!this.shareLink) {
    this.shareLink = Math.random().toString(36).substring(2, 12); // 10-char token
  }
  next();
});

module.exports = mongoose.model('Capsule', CapsuleSchema);
