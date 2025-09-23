// src/components/BackButton.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function BackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  // Show back button only if not on Home or Login page
  const showButton = !["/", "/home"].includes(location.pathname);

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          onClick={() => navigate(-1)}
          className="fixed bottom-6 right-6 bg-zinc-700 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-zinc-600 transition transform hover:scale-105 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          ⬅️ Back
        </motion.button>
      )}
    </AnimatePresence>
  );
}
