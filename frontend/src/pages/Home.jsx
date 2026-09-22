// Home.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import CapsuleList from "../components/CapsuleList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home() {
  const [user, setUser] = useState(null);

  // My capsules (owned)
  const [capsules, setCapsules] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);

  // Shared capsules (public feed)
  const [sharedCapsules, setSharedCapsules] = useState([]);
  const [loadingShared, setLoadingShared] = useState(false);

  // UI state: tabs
  const [activeTab, setActiveTab] = useState("mine"); // "mine" | "shared"

  // Trigger to refetch shared list after toggling share
  const [refreshShared, setRefreshShared] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
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
        headers: authHeader, // ok if endpoint is public
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

      // Keep shared feed in sync locally (no flicker)
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
      // fallback
      prompt("Copy link:", url);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : "";

  return (
    <div className="relative min-h-[calc(100vh-120px)] space-y-8 py-2">
      {user && (
        <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-[28px] p-5 md:flex-row md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-2xl shadow-lg shadow-amber-500/20">
              👋
            </div>
            <div>
              <h2 className="text-2xl font-black text-gradient">{user.name}</h2>
              <p className="text-sm text-slate-300">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-sm text-amber-200">
              Total Capsules: <span className="font-bold text-white">{capsules.length}</span>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="theme-button-secondary px-4 py-2.5"
            >
              👤 Profile
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-rose-500 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-400"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <button
          onClick={() => navigate("/create")}
          className="theme-button-primary py-5 text-lg shadow-[0_18px_30px_rgba(251,191,36,0.22)]"
        >
          ➕ Create Capsule
        </button>

        <button
          onClick={() => setActiveTab("mine")}
          className={`rounded-[22px] border py-5 text-lg font-bold shadow-lg transition ${
            activeTab === "mine"
              ? "border-rose-400/40 bg-rose-500 text-white shadow-rose-500/20"
              : "border-white/10 bg-slate-900/60 text-slate-100 hover:border-rose-400/30 hover:bg-slate-800"
          }`}
        >
          📦 My Capsules
        </button>

        <button
          onClick={() => setActiveTab("shared")}
          className={`rounded-[22px] border py-5 text-lg font-bold shadow-lg transition ${
            activeTab === "shared"
              ? "border-emerald-400/40 bg-emerald-500 text-white shadow-emerald-500/20"
              : "border-white/10 bg-slate-900/60 text-slate-100 hover:border-emerald-400/30 hover:bg-slate-800"
          }`}
        >
          🌍 Shared Capsules
        </button>
      </div>

      {/* CONTENT AREA - Improved UI */}
      <div className="mt-8">
        {activeTab === "mine" ? (
          loadingMy ? (
            <p className="text-center text-zinc-400">Loading capsules...</p>
          ) : errorMsg ? (
            <p className="text-center text-red-400">{errorMsg}</p>
          ) : (
            <CapsuleList capsules={capsules} onShareToggle={handleShareToggle} />
          )
        ) : (
          <>
            {loadingShared ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-zinc-700/60 bg-zinc-800/60 h-40"
                  />
                ))}
              </div>
            ) : sharedCapsules.length === 0 ? (
              <div className="rounded-2xl border border-zinc-700/60 bg-zinc-800/60 p-10 text-center">
                <p className="text-zinc-300">
                  No shared capsules yet. Be the first to share one!
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {sharedCapsules.map((c, idx) => {
                  const title = labelFor(c);
                  const subtitle =
                    c.description || c.message || c.content || "";
                  return (
                    <motion.div
                      key={c._id || c.slug}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className="group relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 shadow-lg hover:shadow-green-500/20 hover:border-green-400/60 transition"
                    >
                      {/* Accent gradient glow */}
                      <div className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 bg-[radial-gradient(600px_circle_at_var(--x,50%)_var(--y,50%),rgba(34,197,94,0.15),transparent_40%)] transition-opacity" />
                      <div
                        className="p-5"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          e.currentTarget.parentElement.style.setProperty(
                            "--x",
                            `${e.clientX - rect.left}px`
                          );
                          e.currentTarget.parentElement.style.setProperty(
                            "--y",
                            `${e.clientY - rect.top}px`
                          );
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-green-400">
                            <span>🌍</span>
                            <span className="text-xs font-medium uppercase tracking-wider">
                              Shared
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400">
                            {formatDate(c.createdAt)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white">
                          {short(title, 64)}
                        </h3>

                        {/* Subtitle/preview */}
                        {subtitle ? (
                          <p className="mt-2 text-sm text-zinc-300">
                            {short(subtitle, 100)}
                          </p>
                        ) : null}

                        {/* Footer actions */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <div className="h-7 w-7 rounded-full bg-zinc-700/60 flex items-center justify-center text-zinc-200">
                              {(c.ownerName || c.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <span>{c.ownerName || c.username || "Someone"}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate(`/capsule/share/${c.slug || c._id}`)
                              }
                              className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm hover:bg-green-400 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => copyLink(c)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 text-sm hover:bg-zinc-600 transition"
                              title="Copy public link"
                            >
                              {copiedId === (c._id || c.slug) ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
