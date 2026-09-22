// Home.jsx - Clean 3-Button Launcher Dashboard
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home() {
  const [user, setUser] = useState(null);
  const [totalCapsules, setTotalCapsules] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  useEffect(() => {
    if (!token) navigate("/", { replace: true });
  }, [token, navigate]);

  const parseUser = (data) => data?.user ?? data ?? null;

  const fetchUserData = useCallback(async () => {
    if (!token) return;
    try {
      const [userRes, capsRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/me`, { headers: authHeader }),
        axios.get(`${API_URL}/api/capsules`, { headers: authHeader }),
      ]);

      setUser(parseUser(userRes.data));
      const list = capsRes.data?.capsules ?? (Array.isArray(capsRes.data) ? capsRes.data : []);
      setTotalCapsules(list.length);
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  }, [token, authHeader]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center space-y-10 py-6">
      {/* User Header Profile Panel */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col items-center justify-between gap-4 rounded-[28px] p-5 sm:p-6 md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-2xl shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              👋
            </motion.div>
            <div>
              <h2 className="text-2xl font-black text-gradient">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1.5 text-xs sm:text-sm text-amber-200">
              Total Capsules: <span className="font-bold text-white ml-1">{totalCapsules}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/profile")}
              className="theme-button-secondary px-4 py-2 text-sm font-medium"
            >
              👤 Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="rounded-2xl bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/30"
            >
              🚪 Logout
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* The 3 Main Action Launcher Buttons (Each navigates to its own dedicated page) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-5xl mx-auto w-full">
        {/* 1. Create Capsule Button */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/create")}
          className="glass-panel cursor-pointer rounded-[28px] border border-amber-400/30 p-7 sm:p-8 text-center shadow-[0_16px_40px_rgba(251,191,36,0.18)] hover:border-amber-400/60 hover:shadow-[0_20px_50px_rgba(251,191,36,0.3)] transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-rose-400 text-3xl shadow-lg shadow-amber-500/30 group-hover:rotate-6 transition-transform">
            ➕
          </div>
          <div>
            <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
              Create Capsule
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Seal a new future memory or surprise
            </p>
          </div>
        </motion.div>

        {/* 2. My Capsules Button */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/my-capsules")}
          className="glass-panel cursor-pointer rounded-[28px] border border-rose-500/30 p-7 sm:p-8 text-center shadow-[0_16px_40px_rgba(244,63,94,0.18)] hover:border-rose-500/60 hover:shadow-[0_20px_50px_rgba(244,63,94,0.3)] transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-3xl shadow-lg shadow-rose-500/30 group-hover:rotate-6 transition-transform">
            📦
          </div>
          <div>
            <h3 className="text-xl font-black text-white group-hover:text-rose-300 transition-colors">
              My Capsules
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              View, edit, and send your locked capsules ({totalCapsules})
            </p>
          </div>
        </motion.div>

        {/* 3. Shared Capsules Button */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/shared-capsules")}
          className="glass-panel cursor-pointer rounded-[28px] border border-emerald-500/30 p-7 sm:p-8 text-center shadow-[0_16px_40px_rgba(16,185,129,0.18)] hover:border-emerald-500/60 hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl shadow-lg shadow-emerald-500/30 group-hover:rotate-6 transition-transform">
            🌍
          </div>
          <div>
            <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
              Shared Capsules
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Explore public memories & community vault
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
