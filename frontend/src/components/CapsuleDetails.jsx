import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import ShareOptions from "./ShareOptions";
import API_URL from "../config/api";

const FRONTEND_URL =
  import.meta.env.FRONTEND_URL ||
  "https://digital-time-capsule-five.vercel.app";

export default function CapsuleDetails({ capsule, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
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

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass-panel relative overflow-hidden rounded-[26px] border border-white/10 p-6 sm:p-7 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-all hover:border-amber-400/30"
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
            <span>{isUnlocked ? "🔓 UNLOCKED" : "🔒 SEALED & LOCKED"}</span>
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Unlock: <span className="font-medium text-slate-200">{unlockDateStr}</span>
        </div>
      </div>

      {/* Capsule Title */}
      <h3 className="text-2xl font-black tracking-wide text-white mb-1.5">
        {capsule.title || "Time Capsule"}
      </h3>

      {/* Recipient Information */}
      <div className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
        <span>✉️ Recipient:</span>
        <span className="text-amber-300 font-semibold">
          {capsule.recipientEmail || "Recipient email not set"}
        </span>
      </div>

      {/* Message Content Area */}
      <div className="rounded-2xl bg-slate-950/70 border border-white/5 p-5 mb-5 shadow-inner">
        {isUnlocked ? (
          <p className="text-base text-slate-100 whitespace-pre-wrap leading-relaxed">
            {capsule.message}
          </p>
        ) : (
          <div className="space-y-2 text-center py-4">
            <div className="text-3xl">⏳</div>
            <p className="text-base font-bold text-amber-200">
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
                📎 {att.name || att.fileName || `File ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Management and Sharing Area */}
      <div className="pt-4 border-t border-white/10 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Share with Recipient
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/edit/${capsule._id}`)}
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
              <span>🗑️</span>
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </motion.button>
          </div>
        </div>

        {/* Share buttons (Send to Recipient, WhatsApp, Copy Link) */}
        <div>
          <ShareOptions shareUrl={shareUrl} capsule={capsule} />
        </div>
      </div>
    </motion.div>
  );
}
