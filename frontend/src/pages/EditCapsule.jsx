import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EditCapsule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        setLoadingData(true);
        const res = await axios.get(`${API_URL}/api/capsules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const found = (res.data.capsules || []).find((c) => c._id === id);
        if (!found) {
          setStatus({ type: "error", message: "Capsule not found" });
          return;
        }

        setTitle(found.title || "");
        setRecipientEmail(found.recipientEmail || "");
        setMessage(found.message || "");

        if (found.unlockDate) {
          const d = new Date(found.unlockDate);
          const dateStr = d.toISOString().split("T")[0];
          const hours = String(d.getHours()).padStart(2, "0");
          const minutes = String(d.getMinutes()).padStart(2, "0");
          setUnlockDate(dateStr);
          setUnlockTime(`${hours}:${minutes}`);
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", message: "Failed to load capsule" });
      } finally {
        setLoadingData(false);
      }
    };

    if (token) fetchCapsule();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setSaving(true);

    try {
      const dateTime = unlockTime ? `${unlockDate}T${unlockTime}` : unlockDate;

      const payload = {
        title: title.trim() || "Time Capsule",
        recipientEmail: recipientEmail.trim(),
        message,
        unlockDate: dateTime,
      };

      await axios.put(`${API_URL}/api/capsules/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setStatus({
        type: "success",
        message: "✨ Capsule updated successfully! Returning to dashboard...",
      });

      setTimeout(() => {
        navigate("/home");
      }, 700);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.error || err.response?.data?.message || err.message || "Failed to update",
      });
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-400 font-medium">Loading capsule details...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-2 sm:py-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-panel w-full rounded-[26px] border border-white/10 p-5 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
        >
          {/* Header with Back Arrow */}
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
                  Edit Time Capsule
                </h2>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Update your capsule details
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              <span>✏️ Editing Mode</span>
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
            {/* Compressed 2-Column Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left Column */}
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
                    Recipient Email
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="friend@example.com"
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

              {/* Right Column: Message */}
              <div className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                    Capsule Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your personal memories, wishes, or secrets..."
                    rows={6}
                    required
                    className="theme-input py-2.5 px-3.5 text-sm rounded-xl min-h-[140px] resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate("/home")}
                className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 font-semibold text-sm transition"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="theme-button-primary w-2/3 py-3 text-sm sm:text-base font-bold shadow-[0_10px_24px_rgba(251,191,36,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
