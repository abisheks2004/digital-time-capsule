import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CreateCapsule from "./pages/CreateCapsule";
import BackButton from "./components/BackButton";
import ShareCapsule from "./pages/ShareCapsule";


export default function App() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ add useNavigate

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const token = localStorage.getItem("token");

  return (
    <div className={`app-shell transition-colors duration-700 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
      <BackButton />

      <nav className={`sticky top-0 z-20 border-b border-white/10 px-4 py-4 backdrop-blur-xl ${darkMode ? "bg-slate-950/70" : "bg-white/70"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-xl shadow-lg shadow-amber-500/20">
              ⏳
            </div>
            <div>
              <div className="text-lg font-black tracking-wide text-gradient">Time Capsule</div>
              <div className={`text-[10px] uppercase tracking-[0.24em] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                preserve your future
              </div>
            </div>
          </div>

          <motion.button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className={`relative h-11 w-20 rounded-full border ${darkMode ? "border-amber-400/30 bg-slate-900/80 shadow-[0_0_30px_rgba(251,191,36,0.25)]" : "border-slate-200 bg-amber-100 shadow-[0_0_30px_rgba(251,146,60,0.2)]"}`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              layout
              className={`flex h-8 w-8 items-center justify-center rounded-full text-lg shadow-md ${darkMode ? "bg-amber-300 text-slate-900" : "bg-white text-amber-600"}`}
              animate={{ x: darkMode ? 42 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {darkMode ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
            </motion.div>
          </motion.button>
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

          {/* Public Share Route */}
          <Route path="/capsule/share/:shareLink" element={<ShareCapsule />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
