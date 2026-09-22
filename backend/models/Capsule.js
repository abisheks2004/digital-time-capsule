import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  name: { type: String },
  fileName: { type: String },
  fileUrl: { type: String },
  fileType: { type: String },
}, { _id: false });

const CapsuleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userEmail: { type: String, required: true },
  title: { type: String, default: "Time Capsule" },
  recipientEmail: { type: String, default: "" },

  message: { type: String, required: true },
  attachments: [AttachmentSchema],

  unlockDate: { type: Date, required: true },

  shareLink: { type: String, unique: true, required: true },

  shared: { type: Boolean, default: true },

  notified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

CapsuleSchema.pre("validate", function (next) {
  if (!this.shareLink) {
    this.shareLink = Math.random().toString(36).substring(2, 12);
  }
  next();
});

// Export as ESM
export default mongoose.models.Capsule || mongoose.model("Capsule", CapsuleSchema);
