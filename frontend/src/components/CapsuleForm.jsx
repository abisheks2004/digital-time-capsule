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
      className="space-y-6 bg-zinc-600 dark:bg-white p-6 rounded-xl shadow-xl max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <div>
        <label className="block font-semibold mb-2 text-[#f59e0b] dark:text-black">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Birthday Surprise"
          className="w-full p-2 rounded-lg border border-zinc-400 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b] bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block font-semibold mb-2 text-[#f59e0b] dark:text-black">
          Capsule Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your capsule message..."
          className="w-full p-4 rounded-lg border border-zinc-400 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b] bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white transition-colors"
          rows={5}
          required
        />
      </div>

      {/* Date & Time */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1">
          <label className="block font-semibold mb-2 text-[#f59e0b] dark:text-black">
            Unlock Date
          </label>
          <input
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            className="w-full p-2 rounded-lg border border-zinc-400 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b] bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white transition-colors"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-2 text-[#f59e0b] dark:text-black">
            Unlock Time
          </label>
          <input
            type="time"
            value={unlockTime}
            onChange={(e) => setUnlockTime(e.target.value)}
            className="w-full p-2 rounded-lg border border-zinc-400 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b] bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white transition-colors"
          />
        </div>
      </div>

      {/* Recipient Email */}
      <div>
        <label className="block font-semibold mb-2 text-[#f59e0b] dark:text-black">
          Recipient Email
        </label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Enter recipient email..."
          required
          className="w-full p-2 border rounded-lg border-zinc-400 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b] bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white transition-colors"
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block font-semibold mb-2 text-[#f59e0b] dark:text-black">
          Attach Media (Image, Audio, Video)
        </label>
        <input
          type="file"
          multiple
          onChange={handleFiles}
          accept="image/*,video/*,audio/*"
          className="w-full p-2 rounded-lg border border-zinc-400 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b] bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white transition-colors"
        />
        {attachments.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-[#f59e0b] dark:text-black">
            {attachments.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(245,158,11,0.5)" }}
        whileTap={{ scale: 0.95 }}
        className="w-full px-6 py-3 bg-[#f59e0b] dark:bg-black text-black dark:text-[#f59e0b] font-semibold rounded-xl shadow-lg transition-all duration-300 hover:bg-[#facc15] dark:hover:bg-zinc-700"
      >
        {loading ? "Creating..." : "Create Capsule"}
      </motion.button>
    </motion.form>
  );
}
