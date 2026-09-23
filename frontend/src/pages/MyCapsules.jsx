import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import CapsuleList from "../components/CapsuleList";
import API_URL from "../config/api";

export default function MyCapsules() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchMine = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get(`${API_URL}/api/capsules`, {
        headers: authHeader,
      });
      const list = res.data?.capsules ?? (Array.isArray(res.data) ? res.data : []);
      setCapsules(list);
    } catch (err) {
      console.error("Error loading capsules:", err);
      setErrorMsg("Unable to load your capsules. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, authHeader]);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  return (
    <div className="min-h-[calc(100vh-100px)] space-y-6 py-4">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/home")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition text-base"
            title="Back to Home"
          >
            ←
          </motion.button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-gradient">
              My Time Capsules
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Your private preserved memories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1.5 text-xs text-amber-200">
            Total Capsules: <span className="font-bold text-white ml-1">{capsules.length}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/create")}
            className="theme-button-primary px-4 py-2 text-xs font-bold shadow-md text-slate-950 flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>New Capsule</span>
          </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse h-40"
              />
            ))}
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-6 text-center text-rose-300 font-medium">
            {errorMsg}
          </div>
        ) : (
          <CapsuleList
            capsules={capsules}
            onRefresh={fetchMine}
          />
        )}
      </div>
    </div>
  );
}
