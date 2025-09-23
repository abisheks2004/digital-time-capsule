import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ShareOptions from "./ShareOptions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CapsuleDetails({ capsule, onDelete, onUpdate }) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    message: capsule.message,
    unlockDate: capsule.unlockDate.slice(0, 16),
    attachments: [], // optional, can be extended later
  });

  const isUnlocked = new Date(capsule.unlockDate) <= new Date();
  const shareUrl = `${API_URL}/api/timecapsules/share/${capsule._id}`;

  // DELETE capsule
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this time capsule?")) return;
    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/api/timecapsules/${capsule._id}`);
      alert("Time capsule deleted successfully!");
      if (onDelete) onDelete(capsule._id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete time capsule. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  // EDIT capsule
  const handleEditSubmit = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/timecapsules/${capsule._id}`, {
        message: formData.message,
        unlockDate: formData.unlockDate,
      });
      alert("✅ Time capsule updated!");
      setEditing(false);
      if (onUpdate) onUpdate(res.data.capsule); // update parent state without reload
    } catch (err) {
      console.error(err);
      alert("❌ " + (err.response?.data?.message || "Update failed"));
    }
  };

  return (
    <motion.div className="p-6 rounded-2xl shadow-xl max-w-xl mx-auto my-6 border bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
      {/* Title */}
      <h2
        className={`text-2xl font-bold mb-4 ${
          isUnlocked ? "text-yellow-600" : "text-red-500"
        }`}
      >
        {isUnlocked ? "Unlocked Time Capsule 🔓" : "Locked Time Capsule 🔒"}
      </h2>

      {/* Message */}
      <p className="mb-4 break-words text-white text-2xl">
        {isUnlocked
          ? capsule.message
          : `Locked until ${new Date(capsule.unlockDate).toLocaleString()}`}
      </p>

      {/* Media Attachments */}
      {isUnlocked && capsule.attachments?.length > 0 && (
        <div className="mb-4 flex flex-col gap-4">
          {capsule.attachments.map((att, index) => {
            if (att.fileType === "image")
              return (
                <img
                  key={index}
                  src={`data:image;base64,${att.fileUrl}`}
                  alt={att.fileName}
                  className="max-w-full rounded-lg shadow-md"
                />
              );
            if (att.fileType === "video")
              return (
                <video
                  key={index}
                  controls
                  className="w-full rounded-lg shadow-md"
                >
                  <source
                    src={`data:video/mp4;base64,${att.fileUrl}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              );
            if (att.fileType === "audio")
              return (
                <audio key={index} controls className="w-full">
                  <source
                    src={`data:audio/mp3;base64,${att.fileUrl}`}
                    type="audio/mpeg"
                  />
                  Your browser does not support the audio element.
                </audio>
              );
            return (
              <a
                key={index}
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {att.fileName}
              </a>
            );
          })}
        </div>
      )}

      {/* Share Options */}
      <ShareOptions shareUrl={shareUrl} disabled={false} />

      {/* Edit Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setEditing(true)}
        className="w-full px-6 py-3 mt-5 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600"
      >
        Edit Time Capsule ✏️
      </motion.button>

      {/* Delete Button */}
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
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
            <input
              type="datetime-local"
              className="w-full p-2 border rounded mb-3"
              value={formData.unlockDate}
              onChange={(e) =>
                setFormData({ ...formData, unlockDate: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-400 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
