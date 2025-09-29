import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ["image", "video", "audio", "link"], required: true },
});

const CapsuleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // 🔑 link to User
    ref: "User",
    required: true,
  },
  userEmail: { type: String, required: true },

  message: { type: String, required: true },
  attachments: [AttachmentSchema],

  unlockDate: { type: Date, required: true },

  shareLink: { type: String, unique: true, required: true },

  shared: { type: Boolean, default: false }, // 🔑 keep this if you want public capsules

  notified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

CapsuleSchema.pre("validate", function (next) {
  if (!this.shareLink) {
    this.shareLink = Math.random().toString(36).substring(2, 12);
  }
  next();
});

// ✅ Export as ESM
export default mongoose.models.Capsule || mongoose.model("Capsule", CapsuleSchema);
