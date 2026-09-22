// Home.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CapsuleList from "../components/CapsuleList";
import CapsuleForm from "../components/CapsuleForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home() {
  const [user, setUser] = useState(null);

  // My capsules (owned)
  const [capsules, setCapsules] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);

  // Shared capsules (public feed)
  const [sharedCapsules, setSharedCapsules] = useState([]);
  const [loadingShared, setLoadingShared] = useState(false);

  // UI state: tabs - "mine" | "create" | "shared"
  const [activeTab, setActiveTab] = useState("mine");

  // Trigger to refetch shared list after toggling share
  const [refreshShared, setRefreshShared] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Read URL query params for initial tab (e.g. /home?tab=create)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "create" || tab === "shared" || tab === "mine") {
      setActiveTab(tab);
    }
  }, [location.search]);

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // Redirect to login if no token
  useEffect(() => {
    if (!token) navigate("/", { replace: true });
  }, [token, navigate]);

  const parseUser = (data) => data?.user ?? data ?? null;
  const parseCapsules = (data) =>
    data?.capsules ?? (Array.isArray(data) ? data : []);
  const parseShared = (data) =>
    data?.sharedCapsules ??
    data?.capsules ??
    data?.data ??
    (Array.isArray(data) ? data : []);

  // Fetch user + my capsules
  const fetchMine = useCallback(async () => {
    if (!token) return;
    setLoadingMy(true);
    setErrorMsg("");
    const controller = new AbortController();

    try {
      const [userRes, capsRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/me`, {
          headers: authHeader,
          signal: controller.signal,
        }),
        axios.get(`${API_URL}/api/capsules`, {
          headers: authHeader,
          signal: controller.signal,
        }),
      ]);

      setUser(parseUser(userRes.data));
      setCapsules(parseCapsules(capsRes.data));
    } catch (err) {
      console.error("Error loading user/capsules:", err);
      setErrorMsg("Unable to load your data. Please log in again.");
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    } finally {
      setLoadingMy(false);
    }

    return () => controller.abort();
  }, [token, authHeader, navigate]);

  // Fetch shared capsules (public feed)
  const fetchShared = useCallback(async () => {
    setLoadingShared(true);
    try {
      const res = await axios.get(`${API_URL}/api/shared-capsules`, {
        headers: authHeader,
      });
      setSharedCapsules(parseShared(res.data));
    } catch (err) {
      console.error("Error loading shared capsules:", err);
    } finally {
      setLoadingShared(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  // Load shared tab on demand
  useEffect(() => {
    if (activeTab === "shared") fetchShared();
  }, [activeTab, fetchShared]);

  // After toggling share, refresh shared feed if that tab is open
  useEffect(() => {
    if (activeTab === "shared") fetchShared();
  }, [refreshShared, activeTab, fetchShared]);

  // Handle successful creation of a capsule
  const handleCapsuleCreated = () => {
    fetchMine();
    setActiveTab("mine");
    setToastMessage("✨ Time Capsule sealed and saved! Switched to My Capsules.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Toggle share on a capsule you own (optimistic update + sync shared list)
  const handleShareToggle = async (capsuleId) => {
    const prev = capsules.find((c) => c._id === capsuleId);
    if (!prev) return;

    // Optimistic update for "My Capsules"
    setCapsules((list) =>
      list.map((c) => (c._id === capsuleId ? { ...c, shared: !c.shared } : c))
    );

    try {
      const res = await axios.put(
        `${API_URL}/api/shared-capsules/${capsuleId}/toggle-share`,
        {},
        { headers: authHeader }
      );
      const updated = res?.data?.capsule ?? prev;

      // Apply backend truth to "My Capsules"
      setCapsules((list) =>
        list.map((c) => (c._id === capsuleId ? updated : c))
      );

      // Keep shared feed in sync locally
      setSharedCapsules((list) => {
        const exists = list.find((c) => c._id === capsuleId);
        if (updated.shared) {
          if (exists) return list.map((c) => (c._id === capsuleId ? updated : c));
          return [updated, ...list];
        }
        return list.filter((c) => c._id !== capsuleId);
      });

      setRefreshShared((v) => !v);
    } catch (err) {
      console.error("Failed to toggle share:", err);
      setCapsules((list) =>
        list.map((c) => (c._id === capsuleId ? prev : c))
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/", { replace: true });
  };

  const labelFor = (c) =>
    (c.title && c.title.trim()) ||
    (c.message && c.message.trim()) ||
    (c.content && c.content.trim()) ||
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
    <div className="relative min-h-[calc(100vh-120px)] space-y-7 py-2">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 rounded-2xl border border-amber-400/40 bg-slate-900/95 px-5 py-3.5 text-sm font-semibold text-amber-200 shadow-2xl backdrop-blur-md"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
              Total Capsules: <span className="font-bold text-white ml-1">{capsules.length}</span>
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

      {/* Unified Single-Page Actions (Create Capsule, My Capsules, Shared Capsules) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("create")}
          className={`rounded-[22px] border py-4 text-base sm:text-lg font-bold shadow-lg transition flex items-center justify-center gap-2.5 ${
            activeTab === "create"
              ? "border-amber-400/50 bg-gradient-to-r from-amber-400 via-yellow-500 to-rose-400 text-slate-950 font-black shadow-[0_12px_30px_rgba(251,191,36,0.35)]"
              : "border-white/10 bg-slate-900/60 text-slate-100 hover:border-amber-400/40 hover:bg-slate-800/80"
          }`}
        >
          <span>➕</span>
          <span>Create Capsule</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("mine")}
          className={`rounded-[22px] border py-4 text-base sm:text-lg font-bold shadow-lg transition flex items-center justify-center gap-2.5 ${
            activeTab === "mine"
              ? "border-rose-400/50 bg-rose-500 text-white shadow-[0_12px_30px_rgba(244,63,94,0.35)]"
              : "border-white/10 bg-slate-900/60 text-slate-100 hover:border-rose-400/40 hover:bg-slate-800/80"
          }`}
        >
          <span>📦</span>
          <span>My Capsules</span>
          <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-bold">
            {capsules.length}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("shared")}
          className={`rounded-[22px] border py-4 text-base sm:text-lg font-bold shadow-lg transition flex items-center justify-center gap-2.5 ${
            activeTab === "shared"
              ? "border-emerald-400/50 bg-emerald-500 text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
              : "border-white/10 bg-slate-900/60 text-slate-100 hover:border-emerald-400/40 hover:bg-slate-800/80"
          }`}
        >
          <span>🌍</span>
          <span>Shared Capsules</span>
        </motion.button>
      </div>

      {/* Main Single-Page Content Area */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {/* CREATE TAB: Full form rendered right on this page! */}
          {activeTab === "create" && (
            <motion.div
              key="create-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <CapsuleForm onSuccess={handleCapsuleCreated} />
            </motion.div>
          )}

          {/* MY CAPSULES TAB */}
          {activeTab === "mine" && (
            <motion.div
              key="mine-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {loadingMy ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse h-36"
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
                  onShareToggle={handleShareToggle}
                  onRefresh={fetchMine}
                />
              )}
            </motion.div>
          )}

          {/* SHARED CAPSULES TAB */}
          {activeTab === "shared" && (
            <motion.div
              key="shared-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {loadingShared ? (
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
                    Be the first to share a public memory with the community! You can toggle sharing on any of your capsules.
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
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <span>🌍</span>
                              <span className="text-[11px] font-bold uppercase tracking-wider">
                                Shared Vault
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatDate(c.createdAt)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-base font-bold text-white line-clamp-2">
                            {short(title, 54)}
                          </h3>

                          {/* Subtitle/preview */}
                          {subtitle && (
                            <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                              {short(subtitle, 120)}
                            </p>
                          )}
                        </div>

                        {/* Footer actions */}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
