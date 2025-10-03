import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ShareOptions from "./ShareOptions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CapsuleDetails({ capsule, onDelete, onUpdate }) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false); // ✅ added state for toggle loading
  const [formData, setFormData] = useState({
    message: capsule.message,
    unlockDate: capsule.unlockDate.slice(0, 16),
  });

  const token = localStorage.getItem("token");
  const isUnlocked = new Date(capsule.unlockDate) <= new Date();
const FRONTEND_URL = import.meta.env.FRONTEND_URL || "https://digital-time-capsule-five.vercel.app";
const shareUrl = `${FRONTEND_URL}/capsule/share/${capsule.shareLink || capsule._id}`;


  // DELETE capsule
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

  // EDIT capsule
  const handleEditSubmit = async () => {
    if (!token) return alert("You are not logged in.");
    try {
      const res = await axios.put(
        `${API_URL}/api/capsules/${capsule._id}`,
        {
          message: formData.message,
          unlockDate: formData.unlockDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
      if (onUpdate) onUpdate(res.data.capsule);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // ✅ Share toggle (with loading state)
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
    <motion.div className="p-6 rounded-2xl shadow-xl max-w-xl mx-auto my-6 border bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
      <h2 className={`text-2xl font-bold mb-4 ${isUnlocked ? "text-yellow-600" : "text-red-500"}`}>
        {isUnlocked ? "Unlocked Time Capsule 🔓" : "Locked Time Capsule 🔒"}
      </h2>

      <p className="mb-4 break-words text-white text-2xl">
        {isUnlocked
          ? capsule.message
          : `Locked until ${new Date(capsule.unlockDate).toLocaleString()}`}
      </p>

      {/* ✅ Share Toggle */}
      <label className="relative inline-flex items-center cursor-pointer mt-2">
        <input
          type="checkbox"
          checked={capsule.shared}
          onChange={handleShareToggle}
          disabled={toggling}
          className="sr-only"
        />
        <div
          className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
            capsule.shared ? "bg-green-500" : "bg-gray-400"
          } ${toggling ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div
            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
              capsule.shared ? "translate-x-7" : "translate-x-0"
            }`}
          ></div>
        </div>
        <span className="ml-3 font-medium text-white">
          {toggling ? "Saving..." : capsule.shared ? "Shared 🌍" : "Share 🌍"}
        </span>
      </label>

      {/* Share Options */}
      <ShareOptions shareUrl={shareUrl} disabled={false} />

      {/* Edit & Delete Buttons */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setEditing(true)}
        className="w-full px-6 py-3 mt-5 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600"
      >
        Edit Time Capsule ✏️
      </motion.button>

      <motion.button
        onClick={handleDelete}
        disabled={deleting}
        className="mt-4 w-full px-6 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete Time Capsule ❌"}
      </motion.button>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-96">
            <h3 className="text-lg font-semibold mb-2">Edit Time Capsule</h3>
            <textarea
              className="w-full p-2 border rounded mb-3"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
            <input
              type="datetime-local"
              className="w-full p-2 border rounded mb-3"
              value={formData.unlockDate}
              onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-400 rounded-md">
                Cancel
              </button>
              <button onClick={handleEditSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
