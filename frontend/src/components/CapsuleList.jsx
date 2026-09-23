import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CapsuleDetails from "./CapsuleDetails";
import API_URL from "../config/api";

export default function CapsuleList({ capsules: propCapsules, onShareToggle, onRefresh }) {
  const [internalCapsules, setInternalCapsules] = useState([]);
  const [loading, setLoading] = useState(!propCapsules);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const capsules = propCapsules !== undefined ? propCapsules : internalCapsules;

  useEffect(() => {
    if (propCapsules !== undefined) return;

    const fetchCapsules = async () => {
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/capsules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInternalCapsules(res.data.capsules || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setError("Unauthorized. Please login again.");
          localStorage.removeItem("token");
        } else {
          setError("Failed to load capsules. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [token, propCapsules]);

  const handleDelete = (id) => {
    if (propCapsules !== undefined && onRefresh) {
      onRefresh();
    } else {
      setInternalCapsules((prev) => prev.filter((capsule) => capsule._id !== id));
    }
  };

  const handleUpdate = (updatedCapsule) => {
    if (propCapsules !== undefined && onRefresh) {
      onRefresh();
    } else {
      setInternalCapsules((prev) =>
        prev.map((c) => (c._id === updatedCapsule._id ? updatedCapsule : c))
      );
    }
  };

  if (loading && propCapsules === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse h-40"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-6 text-center text-rose-300 font-medium">
        {error}
      </div>
    );
  }

  if (!capsules || capsules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-white/10 bg-slate-900/40 p-12 text-center backdrop-blur-md"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-3xl">
          📦
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Capsules Yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          You haven't sealed any memories yet. Click &quot;Create Capsule&quot; above to create your first digital time capsule!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {capsules.map((capsule, index) => (
          <motion.div
            key={capsule._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
          >
            <CapsuleDetails
              capsule={capsule}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onShareToggle={onShareToggle}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
