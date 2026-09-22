import { useState } from "react";
import { motion } from "framer-motion";
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

  const handleFiles = (e) => {
    setAttachments([...attachments, ...Array.from(e.target.files || [])]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dateTime = unlockTime ? `${unlockDate}T${unlockTime}` : unlockDate;

      if (!/^\S+@\S+\.\S+$/.test(recipientEmail.trim())) {
        alert("Please enter a valid recipient email");
        setLoading(false);
        return;
      }

      const payload = {
        title: title || "Time Capsule",
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

      // Reset form
      setTitle("");
      setMessage("");
      setUnlockDate("");
      setUnlockTime("");
      setAttachments([]);
      setRecipientEmail("");

      alert("✅ Capsule created! The recipient will receive an email.");
    } catch (err) {
      console.error(err);
      alert("❌ Error creating capsule: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-6 rounded-[26px] border border-white/10 bg-slate-900/60 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.4)] sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Birthday Surprise"
          className="theme-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
          Capsule Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your capsule message..."
          className="theme-input min-h-[140px] resize-y"
          rows={5}
          required
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
            Unlock Date
          </label>
          <input
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            className="theme-input"
            required
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
            Unlock Time
          </label>
          <input
            type="time"
            value={unlockTime}
            onChange={(e) => setUnlockTime(e.target.value)}
            className="theme-input"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
          Recipient Email
        </label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Enter recipient email..."
          required
          className="theme-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
          Attach Media
        </label>
        <input
          type="file"
          multiple
          onChange={handleFiles}
          accept="image/*,video/*,audio/*"
          className="theme-input cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
        />
        {attachments.length > 0 && (
          <ul className="mt-3 list-disc list-inside text-sm text-slate-300">
            {attachments.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01, boxShadow: "0px 0px 18px rgba(251,191,36,0.35)" }}
        whileTap={{ scale: 0.98 }}
        className="theme-button-primary w-full py-3.5 text-base"
      >
        {loading ? "Creating..." : "Create Capsule"}
      </motion.button>
    </motion.form>
  );
}
