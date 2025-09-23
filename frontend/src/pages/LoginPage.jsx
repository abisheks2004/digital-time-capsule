import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      } else {
        if (!name || !email || !password) return alert("All fields are required!");
        const res = await axios.post(`${API_URL}/api/auth/signup`, { name, email, password });
        alert(res.data.message || "Signup successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
      <motion.form
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6 relative overflow-hidden"
      >
        <motion.h2
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="text-3xl font-extrabold text-center text-yellow-400"
        >
          {isLogin ? "Login" : "Sign Up"}
        </motion.h2>

        {!isLogin && (
          <motion.input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-xl bg-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
        )}

        <motion.input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        />
        <motion.input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-xl bg-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        />

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-red-500 text-black font-bold shadow-lg hover:from-yellow-300 hover:to-red-400 transition-all duration-300"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </motion.button>

        <motion.p
          className="text-center text-sm text-zinc-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {isLogin ? "Don’t have an account? " : "Already have an account? "}
          <span
            className="text-yellow-400 cursor-pointer underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </motion.p>
      </motion.form>
    </div>
  );
}
