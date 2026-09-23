import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import API_URL from "../config/api";

export default function SharedCapsules() {
  const [sharedCapsules, setSharedCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const parseShared = (data) =>
    data?.sharedCapsules ??
    data?.capsules ??
    data?.data ??
    (Array.isArray(data) ? data : []);

  const fetchShared = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/shared-capsules`, {
        headers: authHeader,
      });
      setSharedCapsules(parseShared(res.data));
    } catch (err) {
      console.error("Error loading shared capsules:", err);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchShared();
  }, [fetchShared]);

  const labelFor = (c) =>
    (c.title && c.title.trim()) ||
    (c.message && c.message.trim()) ||
    "Untitled Capsule";

  const short = (text, len = 84) =>
    text.length > len ? `${text.slice(0, len)}…` : text;

  const copyLink = async (c) => {
    const slug = c.slug || c._id;
    const url = `${window.location.origin}/capsule/share/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(c._id || c.slug);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      prompt("Copy link:", url);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : "";

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
              Shared Vault
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Community & shared memories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3.5 py-1.5 rounded-full">
          <span>🌍 Public Vault Active</span>
        </div>
      </div>

      {/* Grid of Shared Capsules */}
      <div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/5 bg-slate-900/60 h-44"
              />
            ))}
          </div>
        ) : sharedCapsules.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/40 p-12 text-center backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-3xl">
              🌍
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Shared Capsules Yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Be the first to share a public memory with the community!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sharedCapsules.map((c, idx) => {
              const title = labelFor(c);
              const subtitle =
                c.description || c.message || c.content || "";
              return (
                <motion.div
                  key={c._id || c.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-lg hover:shadow-emerald-500/15 hover:border-emerald-400/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span>🌍</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Shared
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-2">
                      {short(title, 54)}
                    </h3>

                    {subtitle && (
                      <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {short(subtitle, 120)}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
                        {(c.ownerName || c.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[90px]">{c.ownerName || c.username || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          navigate(`/capsule/share/${c.slug || c._id}`)
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
                      >
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyLink(c)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition border border-white/10"
                        title="Copy public link"
                      >
                        {copiedId === (c._id || c.slug) ? "Copied!" : "Copy"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
