import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CapsuleForm({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...selected]);
  };

  const removeFile = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const dateTime = unlockTime ? `${unlockDate}T${unlockTime}` : unlockDate;

      if (!/^\S+@\S+\.\S+$/.test(recipientEmail.trim())) {
        setStatus({
          type: "error",
          message: "Please enter a valid recipient email address.",
        });
        setLoading(false);
        return;
      }

      const payload = {
        title: title.trim() || "Time Capsule",
        message,
        unlockDate: dateTime,
        recipientEmail: recipientEmail.trim(),
        attachments: attachments.map((f) => ({ name: f.name })),
      };

      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/capsules`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Reset form
      setTitle("");
      setMessage("");
      setUnlockDate("");
      setUnlockTime("");
      setAttachments([]);
      setRecipientEmail("");

      setStatus({
        type: "success",
        message: "✨ Time Capsule sealed and stored! The recipient will receive an email on the unlock date.",
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(res.data.capsule);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.error || err.response?.data?.message || err.message || "Error creating capsule",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="glass-panel w-full rounded-[28px] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-2xl shadow-lg shadow-amber-500/25">
            ✨
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-wide text-gradient">Create New Capsule</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preserve memories for tomorrow</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-300/80 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full w-fit">
          <span>🔒 Fully Encrypted Storage</span>
        </div>
      </div>

      <AnimatePresence>
        {status.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 overflow-hidden rounded-2xl p-4 text-sm font-medium border ${
              status.type === "success"
                ? "border-emerald-400/40 bg-emerald-950/60 text-emerald-200"
                : "border-rose-400/40 bg-rose-950/60 text-rose-200"
            }`}
          >
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Metadata */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Capsule Title
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Letter to Future Me, Birthday 2027"
                className="theme-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Recipient Email <span className="text-rose-400">*</span>
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                required
                className="theme-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                  Unlock Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="theme-input cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                  Unlock Time
                </label>
                <input
                  type="time"
                  value={unlockTime}
                  onChange={(e) => setUnlockTime(e.target.value)}
                  className="theme-input cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Message & Media */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Capsule Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What memories, hopes, or secrets do you want to seal in this capsule?"
                rows={5}
                required
                className="theme-input min-h-[140px] resize-y"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Media Attachments (Photos, Videos, Audio)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="capsule-file-upload"
                  multiple
                  onChange={handleFiles}
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                />
                <label
                  htmlFor="capsule-file-upload"
                  className="flex flex-col items-center justify-center p-4 border border-dashed border-white/20 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 hover:border-amber-400/50 transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📎</span>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-300">
                    Click to browse files
                  </span>
                  <span className="text-[10px] text-slate-500">Supports images, audio, video files</span>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200"
                    >
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-amber-400 hover:text-rose-400 transition ml-1"
                        aria-label="Remove attachment"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="theme-button-primary w-full py-4 text-base font-bold shadow-[0_12px_28px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                <span>Sealing Time Capsule...</span>
              </>
            ) : (
              <>
                <span>⏳</span>
                <span>Seal & Store Capsule</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
