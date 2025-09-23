import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CapsuleDetails from "./CapsuleDetails";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CapsuleList() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCapsules();
  }, []);

 const fetchCapsules = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/capsules`);
    setCapsules(res.data.capsules || []); // <-- use the array
  } catch (err) {
    console.error(err);
    setError("Failed to load capsules. Please try again later.");
  } finally {
    setLoading(false);
  }
};


  const handleDelete = (id) => {
    setCapsules((prev) => prev.filter((capsule) => capsule._id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-zinc-200 dark:bg-zinc-700 animate-pulse h-32"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 font-semibold text-center mt-6">{error}</p>
    );
  }

  if (capsules.length === 0) {
    return (
      <p className="text-gray-700 dark:text-gray-300 font-medium text-center mt-6">
        No capsules yet. Create one!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {capsules.map((capsule) => (
          <motion.div
            key={capsule._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <CapsuleDetails capsule={capsule} onDelete={handleDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
