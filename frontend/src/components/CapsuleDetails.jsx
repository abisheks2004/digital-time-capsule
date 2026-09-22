import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ShareOptions from "./ShareOptions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FRONTEND_URL =
  import.meta.env.FRONTEND_URL ||
  "https://digital-time-capsule-five.vercel.app";

export default function CapsuleDetails({ capsule, onDelete, onUpdate }) {
  const utcDate = new Date(capsule.unlockDate);
  const tzOffset = utcDate.getTimezoneOffset() * 60000;
  const localInputDate = new Date(utcDate.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);

  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [formData, setFormData] = useState({
    title: capsule.title || "",
    message: capsule.message || "",
    unlockDate: localInputDate,
  });

  const token = localStorage.getItem("token");

  // Unlock logic
  const unlockDate = new Date(capsule.unlockDate);
  const isUnlocked = unlockDate.getTime() <= Date.now();

  const unlockDateStr = unlockDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const shareUrl = `${FRONTEND_URL}/capsule/share/${capsule.shareLink || capsule._id}`;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this time capsule?")) return;
    if (!token) return alert("You are not logged in.");

    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/api/capsules/${capsule._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDelete) onDelete(capsule._id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete time capsule.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!token) return alert("You are not logged in.");
    try {
      const res = await axios.put(
        `${API_URL}/api/capsules/${capsule._id}`,
        {
          title: formData.title,
          message: formData.message,
          unlockDate: formData.unlockDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
      if (onUpdate) onUpdate(res.data.capsule);
    } catch (err) {
      console.error(err);
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleShareToggle = async () => {
    if (!token) return alert("You are not logged in.");
    try {
      setToggling(true);
      const res = await axios.put(
        `${API_URL}/api/capsules/${capsule._id}`,
        { shared: !capsule.shared },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onUpdate) onUpdate(res.data.capsule);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle share");
    } finally {
      setToggling(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass-panel relative overflow-hidden rounded-[26px] border border-white/10 p-6 sm:p-7 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-all hover:border-amber-400/30 hover:shadow-[0_20px_50px_rgba(251,191,36,0.1)]"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              isUnlocked
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}
          >
            <span>{isUnlocked ? "🔓 Unlocked" : "🔒 Sealed & Locked"}</span>
          </span>

          {capsule.shared && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              🌍 Shared
            </span>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Unlock: <span className="font-medium text-slate-200">{unlockDateStr}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-black tracking-wide text-white mb-2">
        {capsule.title || "Untitled Capsule"}
      </h3>

      {/* Recipient info */}
      {capsule.recipientEmail && (
        <div className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
          <span>✉️ Recipient:</span>
          <span className="text-amber-300/90 font-medium">{capsule.recipientEmail}</span>
        </div>
      )}

      {/* Message Content */}
      <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4 mb-5">
        {isUnlocked ? (
          <p className="text-base text-slate-100 whitespace-pre-wrap leading-relaxed">
            {capsule.message}
          </p>
        ) : (
          <div className="space-y-1.5 text-center py-4">
            <div className="text-2xl">⏳</div>
            <p className="text-sm font-semibold text-amber-200">
              Message content is sealed and encrypted
            </p>
            <p className="text-xs text-slate-400">
              This capsule will open automatically on {unlockDateStr}
            </p>
          </div>
        )}
      </div>

      {/* Media Attachments */}
      {capsule.attachments && capsule.attachments.length > 0 && (
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Attachments ({capsule.attachments.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {capsule.attachments.map((att, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-800/80 border border-white/10 px-2.5 py-1 text-xs text-slate-300"
              >
                📎 {att.name || `File ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
        {/* Share Toggle */}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={capsule.shared}
            onChange={handleShareToggle}
            disabled={toggling}
            className="sr-only"
          />
          <div
            className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-300 ${
              capsule.shared ? "bg-emerald-500" : "bg-slate-700"
            } ${toggling ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
                capsule.shared ? "translate-x-5.5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="ml-3 text-xs font-semibold text-slate-300">
            {toggling
              ? "Saving..."
              : capsule.shared
              ? "Public Link Enabled 🌍"
              : "Make Public"}
          </span>
        </label>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700 hover:border-white/20 transition flex items-center gap-1.5"
          >
            <span>✏️</span>
            <span>Edit</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>❌</span>
            <span>{deleting ? "Deleting..." : "Delete"}</span>
          </motion.button>
        </div>
      </div>

      {/* Share Options Drawer/Links if shared */}
      {capsule.shared && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <ShareOptions shareUrl={shareUrl} capsule={capsule} />
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-lg rounded-[28px] border border-white/15 p-6 sm:p-7 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>✏️</span>
                <span>Edit Time Capsule</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="theme-input text-sm"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                    Message
                  </label>
                  <textarea
                    className="theme-input text-sm resize-y"
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                    Unlock Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="theme-input text-sm"
                    value={formData.unlockDate}
                    onChange={(e) =>
                      setFormData({ ...formData, unlockDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEditSubmit}
                  className="theme-button-primary px-5 py-2 text-sm"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
