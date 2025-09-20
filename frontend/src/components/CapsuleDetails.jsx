import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function CapsuleDetails({ capsule, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const isUnlocked = new Date(capsule.unlockDate) <= new Date();
  const shareUrl = `http://localhost:5000/api/capsules/share/${capsule._id}`;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this capsule?")) return;

    try {
      setDeleting(true);
      await axios.delete(`http://localhost:5000/api/capsules/${capsule._id}`);
      if (onDelete) onDelete(capsule._id); // remove from parent list
      alert("Capsule deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete capsule. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      className="p-6 rounded-2xl shadow-xl max-w-xl mx-auto my-6 border transition-colors
                 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <h2 className={`text-2xl font-bold mb-4 transition-colors
                     ${isUnlocked ? "text-[#f59e0b] dark:text-[#facc15]" : "text-red-500"}`}>
        {isUnlocked ? "Unlocked Capsule 🔓" : "Locked Capsule 🔒"}
      </h2>

      {/* Message */}
      <p className="mb-6 break-words text-zinc-900 dark:text-zinc-100 text-lg leading-relaxed transition-colors">
        {isUnlocked
          ? capsule.message
          : `Locked until ${new Date(capsule.unlockDate).toLocaleString()}`}
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        {/* Share */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(245, 158, 11, 0.7)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            alert("Share link copied!");
          }}
          disabled={!isUnlocked}
          className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300
                     bg-gradient-to-r from-[#f59e0b] to-[#facc15] text-black shadow-lg
                     hover:from-[#facc15] hover:to-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed
                     dark:bg-gradient-to-r dark:from-[#facc15] dark:to-[#f59e0b] dark:text-black"
        >
          {isUnlocked ? "Share Capsule 🔗" : "Can't Share Yet"}
        </motion.button>

        {/* Delete */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(255,0,0,0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          disabled={deleting}
          className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300
                     bg-red-500 text-white shadow-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
                     dark:bg-red-700 dark:hover:bg-red-800"
        >
          {deleting ? "Deleting..." : "Delete Capsule ❌"}
        </motion.button>
      </div>
    </motion.div>
  );
}
