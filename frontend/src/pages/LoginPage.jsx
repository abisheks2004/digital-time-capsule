import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API_URL from "../config/api";

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
      alert(err.response?.data?.message || err.response?.data?.error || err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-90px)] items-center justify-center px-4 py-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-rose-400/10 blur-3xl" />
      </div>

      <motion.form
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="glass-panel halo-ring w-full max-w-md space-y-6 rounded-[28px] p-7 sm:p-8"
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-2xl shadow-lg shadow-amber-500/20">
            ⏳
          </div>
          <motion.h2
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 120 }}
            className="text-3xl font-black text-gradient"
          >
            {isLogin ? "Welcome back" : "Create account"}
          </motion.h2>
          <p className="text-sm text-slate-300">
            {isLogin ? "Unlock the moments you want to revisit." : "Start saving your future memories."}
          </p>
        </div>

        {!isLogin && (
          <motion.input
            type="text"
            placeholder="Full Name"
            className="theme-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}

        <motion.input
          type="email"
          placeholder="Email"
          className="theme-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.28 }}
        />
        <motion.input
          type="password"
          placeholder="Password"
          className="theme-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.36 }}
        />

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="theme-button-primary w-full py-3.5 text-base"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </motion.button>

        <motion.p
          className="text-center text-sm text-slate-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {isLogin ? "Don’t have an account? " : "Already have an account? "}
          <span
            className="cursor-pointer font-semibold text-amber-300 underline-offset-4 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </motion.p>
      </motion.form>
    </div>
  );
}
