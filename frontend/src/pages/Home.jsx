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
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center space-y-6 py-4">
      {/* Compact User Header Profile Panel */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 md:flex-row shadow-lg max-w-4xl mx-auto w-full border border-white/10"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-lg shadow-md shadow-amber-500/20 cursor-pointer"
            >
              👋
            </motion.div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gradient leading-tight">{user.name}</h2>
              <p className="text-xs text-slate-400 leading-tight">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
              Total: <span className="font-bold text-white ml-0.5">{totalCapsules}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/profile")}
              className="theme-button-secondary px-3 py-1.5 text-xs font-medium rounded-xl"
            >
              👤 Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30"
            >
              🚪 Logout
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* The 3 Main Action Launcher Buttons (Compact Mini-Tiles) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-4xl mx-auto w-full">
        {/* 1. Create Capsule Button */}
        <motion.div
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/create")}
          className="glass-panel cursor-pointer rounded-2xl border border-amber-400/25 p-4 sm:p-5 text-center shadow-md hover:border-amber-400/60 hover:shadow-[0_12px_28px_rgba(251,191,36,0.22)] transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-rose-400 text-xl shadow-md shadow-amber-500/25 group-hover:rotate-6 transition-transform">
            ➕
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Create Capsule
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Seal a new future memory
            </p>
          </div>
        </motion.div>

        {/* 2. My Capsules Button */}
        <motion.div
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/my-capsules")}
          className="glass-panel cursor-pointer rounded-2xl border border-rose-500/25 p-4 sm:p-5 text-center shadow-md hover:border-rose-500/60 hover:shadow-[0_12px_28px_rgba(244,63,94,0.22)] transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500 text-xl shadow-md shadow-rose-500/25 group-hover:rotate-6 transition-transform">
            📦
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              My Capsules
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Your preserved capsules ({totalCapsules})
            </p>
          </div>
        </motion.div>

        {/* 3. Shared Capsules Button */}
        <motion.div
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/shared-capsules")}
          className="glass-panel cursor-pointer rounded-2xl border border-emerald-500/25 p-4 sm:p-5 text-center shadow-md hover:border-emerald-500/60 hover:shadow-[0_12px_28px_rgba(16,185,129,0.22)] transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-xl shadow-md shadow-emerald-500/25 group-hover:rotate-6 transition-transform">
            🌍
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Shared Vault
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Explore public memories
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
