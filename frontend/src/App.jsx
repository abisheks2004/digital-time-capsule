import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"; // install heroicons first
import Home from "./pages/Home";
import CreateCapsule from "./pages/CreateCapsule";
import SharedCapsuleView from "./components/SharedCapsuleView";

export default function App() {
  const location = useLocation();

  // Dark mode toggle (persistent)
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

  return (
    <div className="min-h-screen transition-colors duration-700">
      {/* Background */}
      <div
        className={`min-h-screen transition-colors duration-700 ${
          darkMode
            ? "bg-zinc-500 text-[#f59e0b]"
            : "bg-white text-black"
        }`}
      >
        {/* Navbar */}
        <nav
          className={`p-4 flex justify-between items-center rounded-b-xl shadow-md transition-colors duration-500 ${
            darkMode ? "bg-black" : "bg-[#f59e0b]"
          }`}
        >
          <Link
            to="/"
            className="font-bold text-lg hover:text-[#f87171] transition-colors"
          >
            ⏳ Time Capsule
          </Link>

          <div className="flex items-center space-x-4">
            {/* Create Capsule Button */}
            <Link
              to="/create"
              className="relative inline-block px-6 py-2 rounded-lg font-semibold text-white bg-[#f59e0b] shadow-md transition-all duration-300
                         hover:bg-[#facc15] hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
            >
              Create Capsule
              <span className="absolute inset-0 rounded-lg blur opacity-20 bg-gradient-to-r from-[#f59e0b] to-[#f87171]"></span>
            </Link>

            {/* Slide Toggle with Glow & Icons */}
            <motion.button
              onClick={toggleDarkMode}
              className={`relative w-20 h-10 rounded-full p-1 flex items-center cursor-pointer shadow-lg transition-colors duration-300 ${
                darkMode
                  ? "bg-black shadow-[#f59e0b]/60"
                  : "bg-[#f59e0b] shadow-[#f87171]/60"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {/* Sliding Circle */}
              <motion.div
                layout
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md ${
                  darkMode ? "bg-[#f59e0b] text-black" : "bg-white text-[#f87171]"
                }`}
                animate={{ x: darkMode ? 40 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {darkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </motion.div>
            </motion.button>
          </div>
        </nav>

        {/* Main Content Container */}
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Home />
                  </motion.div>
                }
              />
              <Route
                path="/create"
                element={
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CreateCapsule />
                  </motion.div>
                }
              />
              <Route
                path="/capsule/share/:token"
                element={
                  <motion.div
                    key="shared"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SharedCapsuleView />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
