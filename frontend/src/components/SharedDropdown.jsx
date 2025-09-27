// SharedDropdown.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SharedDropdown({ token, refreshTrigger }) {
  const [sharedCapsules, setSharedCapsules] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, minWidth: 240 });
  const anchorRef = useRef(null);
  const navigate = useNavigate();

  const parseList = (data) => {
    const list =
      data?.sharedCapsules ??
      data?.capsules ??
      data?.data ??
      (Array.isArray(data) ? data : []);
    return Array.isArray(list) ? list : [];
  };

  const fetchSharedCapsules = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_URL}/api/shared-capsules`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setSharedCapsules(parseList(res.data));
    } catch (err) {
      console.error("Failed to load shared capsules:", err);
      setErrorMsg("Unable to load shared capsules. Please try again.");
      setSharedCapsules([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Position dropdown (ported to body to avoid clipping/overflow issues)
  const positionMenu = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8, // 8px gap
      left: rect.left,
      minWidth: Math.max(rect.width, 280),
    });
  };

  // Open/close and fetch on open
  const toggleMenu = () => {
    const next = !showDropdown;
    setShowDropdown(next);
    if (!showDropdown) {
      positionMenu();
      fetchSharedCapsules();
    }
  };

  // Reposition on resize/scroll while open
  useEffect(() => {
    if (!showDropdown) return;
    const onWin = () => positionMenu();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [showDropdown]);

  // Close on outside click / Esc
  useEffect(() => {
    if (!showDropdown) return;
    const onDown = (e) => {
      if (
        anchorRef.current &&
        !anchorRef.current.contains(e.target) &&
        !(e.target.closest && e.target.closest("#shared-dropdown-portal"))
      ) {
        setShowDropdown(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setShowDropdown(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showDropdown]);

  // If a parent toggles share state, refresh list when open
  useEffect(() => {
    if (showDropdown) fetchSharedCapsules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleNavigate = (capsule) => {
    const slugOrId = capsule.slug || capsule._id;
    navigate(`/capsule/share/${slugOrId}`);
    setShowDropdown(false);
  };

  const labelFor = (c) =>
    (c.title && c.title.trim()) ||
    (c.message && c.message.trim()) ||
    (c.content && c.content.trim()) ||
    "Untitled Capsule";

  return (
    <div className="relative" ref={anchorRef}>
      <button
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={showDropdown}
        className="bg-green-500 text-white py-6 rounded-xl font-bold text-lg shadow-md hover:bg-green-400 transition transform hover:scale-105 w-full"
      >
        🌍 Shared Capsules
      </button>

      {showDropdown &&
        createPortal(
          <div
            id="shared-dropdown-portal"
            role="menu"
            className="fixed z-[10000] rounded-lg border border-zinc-700 bg-zinc-800 text-white shadow-2xl"
            style={{
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              minWidth: `${menuPos.minWidth}px`,
              maxWidth: "320px",
              maxHeight: "320px",
              overflow: "auto",
            }}
          >
            {loading && (
              <div className="px-4 py-3 text-sm text-zinc-300">Loading…</div>
            )}

            {!loading && errorMsg && (
              <div className="px-4 py-3 text-sm text-red-400">{errorMsg}</div>
            )}

            {!loading && !errorMsg && sharedCapsules.length === 0 && (
              <div className="px-4 py-3 text-sm text-zinc-300">
                No shared capsules available
              </div>
            )}

            {!loading &&
              !errorMsg &&
              sharedCapsules.map((capsule) => {
                const text = labelFor(capsule);
                const short = text.length > 40 ? `${text.slice(0, 40)}…` : text;
                return (
                  <button
                    key={capsule._id || capsule.slug}
                    onClick={() => handleNavigate(capsule)}
                    role="menuitem"
                    className="block w-full text-left px-4 py-2 hover:bg-zinc-700 transition"
                    title={text}
                  >
                    {short}
                  </button>
                );
              })}
          </div>,
          document.body
        )}
    </div>
  );
}
