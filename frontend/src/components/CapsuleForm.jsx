import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CapsuleForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const navigate = useNavigate();

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
      await axios.post(`${API_URL}/api/capsules`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setStatus({
        type: "success",
        message: "✨ Capsule sealed! Sending to recipient...",
      });

      // Seamlessly return to dashboard after short confirmation
      setTimeout(() => {
        navigate("/home");
      }, 700);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.error || err.response?.data?.message || err.message || "Error creating capsule",
      });
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-panel w-full rounded-[26px] border border-white/10 p-5 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
    >
      {/* Compact Top Navigation / Header */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/home")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition text-sm"
            title="Back to Dashboard"
          >
            ←
          </motion.button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-gradient leading-tight">
              Create Time Capsule
            </h2>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Seal a moment for someone special
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
          <span>🔒 Encrypted Vault</span>
        </div>
      </div>

      <AnimatePresence>
        {status.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-3.5 overflow-hidden rounded-xl p-3 text-xs font-semibold border ${
              status.type === "success"
                ? "border-emerald-400/40 bg-emerald-950/70 text-emerald-200"
                : "border-rose-400/40 bg-rose-950/70 text-rose-200"
            }`}
          >
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Compressed 2-Column Grid (Fits 100% on Laptop Viewport) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left Column: Title, Recipient, Unlock Date & Time */}
          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                Capsule Title
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Birthday Surprise 2027"
                className="theme-input py-2.5 px-3.5 text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                Recipient Email <span className="text-rose-400">*</span>
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                required
                className="theme-input py-2.5 px-3.5 text-sm rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                  Unlock Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="theme-input py-2 px-3 text-xs sm:text-sm rounded-xl cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                  Unlock Time
                </label>
                <input
                  type="time"
                  value={unlockTime}
                  onChange={(e) => setUnlockTime(e.target.value)}
                  className="theme-input py-2 px-3 text-xs sm:text-sm rounded-xl cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Message & Attachments */}
          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                Capsule Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your personal memories, wishes, or secrets..."
                rows={4}
                required
                className="theme-input py-2.5 px-3.5 text-sm rounded-xl min-h-[96px] max-h-[140px] resize-y"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                Attach Media (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="capsule-file-input"
                  multiple
                  onChange={handleFiles}
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                />
                <label
                  htmlFor="capsule-file-input"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-white/20 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 hover:border-amber-400/40 transition-all cursor-pointer group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">📎</span>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-300">
                    Browse photos, audio, or video
                  </span>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                  {attachments.map((file, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200"
                    >
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-amber-400 hover:text-rose-400 ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-1">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="theme-button-primary w-full py-3 text-sm sm:text-base font-bold shadow-[0_10px_24px_rgba(251,191,36,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
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
