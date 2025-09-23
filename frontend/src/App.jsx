import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CreateCapsule from "./pages/CreateCapsule";
import SharedCapsuleView from "./components/SharedCapsuleView";
import BackButton from "./components/BackButton";

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
    <div className={`min-h-screen transition-colors duration-700 ${darkMode ? "bg-zinc-900 text-yellow-400" : "bg-white text-black"}`}>

    {/* Sticky Back Button */}
      <BackButton />

      {/* Navbar */}
      <nav className={`p-4 flex justify-between items-center rounded-b-xl shadow-md transition-colors duration-500 ${darkMode ? "bg-black" : "bg-yellow-400"}`}>
        <span className="font-bold text-lg hover:text-red-400 transition-colors cursor-pointer">⏳ Time Capsule</span>

        <motion.button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className={`relative w-20 h-10 rounded-full p-1 flex items-center cursor-pointer shadow-lg transition-colors duration-300 ${darkMode ? "bg-black shadow-yellow-400/60" : "bg-yellow-400 shadow-red-400/60"}`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            layout
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md ${darkMode ? "bg-yellow-400 text-black" : "bg-white text-red-500"}`}
            animate={{ x: darkMode ? 40 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {darkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </motion.div>
        </motion.button>
      </nav>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Routes location={location} key={location.pathname}>
          {/* Public Route */}
          <Route path="/" element={!token ? <LoginPage /> : <Navigate to="/home" />} />

          {/* Protected Routes */}
          <Route path="/home" element={token ? <Home /> : <Navigate to="/" />} />
          <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/" />} />
          <Route path="/create" element={token ? <CreateCapsule /> : <Navigate to="/" />} />
          <Route path="/capsule/share/:token" element={<SharedCapsuleView />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
