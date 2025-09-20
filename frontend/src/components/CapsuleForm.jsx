import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function CapsuleForm() {
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

  // Handle file input changes
  const handleFiles = (e) => {
    setAttachments([...attachments, ...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("unlockDate", unlockDate);
      formData.append("unlockTime", unlockTime);

      attachments.forEach((file) => formData.append("attachments", file));

      const res = await axios.post(
        "http://localhost:5000/api/capsules",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setLink(`http://localhost:5173/capsule/share/${res.data.shareLink}`);
      setMessage("");
      setUnlockDate("");
      setUnlockTime("");
      setAttachments([]);
    } catch (err) {
      console.error(err);
      alert("Error creating capsule");
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

      {/* Attachments */}
      <div>
        <label className="block font-semibold mb-2 text-[#f59e0b] dark:text-black">
          Attach Media (Image, Audio, Video, Links)
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

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(245,158,11,0.5)" }}
        whileTap={{ scale: 0.95 }}
        className="w-full px-6 py-3 bg-[#f59e0b] dark:bg-black text-black dark:text-[#f59e0b] font-semibold rounded-xl shadow-lg transition-all duration-300 hover:bg-[#facc15] dark:hover:bg-zinc-700"
      >
        {loading ? "Creating..." : "Create Capsule"}
      </motion.button>

      {/* Share Link */}
      {link && (
        <p className="mt-4 text-center text-sm text-[#f87171] dark:text-black break-all">
          ✅ Share this link:{" "}
          <a href={link} target="_blank" className="underline hover:text-[#facc15]">
            {link}
          </a>
        </p>
      )}
    </motion.form>
  );
}
