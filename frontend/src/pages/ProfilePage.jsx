import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API_URL from "../config/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [capsules, setCapsules] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (err) {
        console.error("❌ Failed to load user:", err.message);
      }
    };

    const fetchCapsules = async () => {
      try {
        const res = await fetch(`${API_URL}/api/capsules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCapsules(data.capsules || data || []);
      } catch (err) {
        console.error("❌ Failed to load capsules:", err.message);
      }
    };

    if (token) {
      fetchUser();
      fetchCapsules();
    }
  }, [token]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setUser(data.user || data);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      await fetch(`${API_URL}/api/users/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      alert("Account deleted!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-400 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-panel w-full max-w-2xl rounded-[30px] p-7 sm:p-9 shadow-2xl border border-white/10"
      >
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/home")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition text-sm"
              title="Back to Dashboard"
            >
              ←
            </motion.button>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-xl shadow-md shadow-amber-600/25 cursor-pointer"
              >
                👤
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gradient leading-tight">
                  Profile & Vault
                </h1>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Account settings
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            <span>👤 User Profile</span>
          </div>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                Name
              </label>
              <input
                className="theme-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                Email
              </label>
              <input
                className="theme-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center py-4 rounded-2xl bg-slate-900/50 border border-white/5">
            <p className="text-2xl font-bold text-white">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
        )}

        <div className="my-6 flex items-center justify-center gap-2 text-sm text-slate-300">
          <span>📦 Total Vault Capsules:</span>
          <span className="font-bold text-amber-300 text-base">{capsules.length}</span>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          {editMode ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdate}
              className="theme-button-primary flex-1 px-6 py-3 font-bold shadow-lg"
            >
              💾 Save Profile
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditMode(true)}
              className="theme-button-secondary flex-1 px-6 py-3 font-semibold"
            >
              ✏️ Edit Profile
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}
            className="flex-1 rounded-2xl bg-rose-500/20 border border-rose-500/30 px-6 py-3 font-semibold text-rose-300 shadow-lg transition hover:bg-rose-500/30"
          >
            🗑️ Delete Account
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
