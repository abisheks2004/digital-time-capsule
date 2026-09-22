import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CreateCapsule from "./pages/CreateCapsule";
import EditCapsule from "./pages/EditCapsule";
import ShareCapsule from "./pages/ShareCapsule";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const token = localStorage.getItem("token");

  return (
    <div className="app-shell text-slate-100 min-h-screen">
      <nav className="sticky top-0 z-20 border-b border-white/10 px-4 py-4 backdrop-blur-xl bg-slate-950/80 shadow-lg shadow-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <motion.div
            onClick={() => navigate(token ? "/home" : "/")}
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-xl shadow-lg shadow-amber-500/25 transition-transform group-hover:rotate-12 duration-300">
              ⏳
            </div>
            <div>
              <div className="text-lg font-black tracking-wide text-gradient">Time Capsule</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                preserve your future
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium tracking-wide">Vault Protected</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={!token ? <LoginPage /> : <Navigate to="/home" replace />} />
          <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/home" replace />} />

          {/* Protected Routes */}
          <Route path="/home" element={token ? <Home /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/" replace />} />
          <Route path="/create" element={token ? <CreateCapsule /> : <Navigate to="/" replace />} />
          <Route path="/edit/:id" element={token ? <EditCapsule /> : <Navigate to="/" replace />} />

          {/* Public Share Route */}
          <Route path="/capsule/share/:shareLink" element={<ShareCapsule />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
