// src/components/ShareOptions.jsx
import { useState } from "react";
import { FaWhatsapp, FaLink, FaCheck, FaPaperPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API_URL from "../config/api";

export default function ShareOptions({ shareUrl, capsule }) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  const token = localStorage.getItem("token");

  // Copy to clipboard with fallback
  const safeCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const tmp = document.createElement("input");
      document.body.appendChild(tmp);
      tmp.value = text;
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Direct backend email dispatch to recipient
  const handleSendToRecipient = async () => {
    if (!capsule.recipientEmail || !capsule.recipientEmail.trim()) {
      setSendMsg("⚠️ No recipient email set! Click Edit to add one.");
      setTimeout(() => setSendMsg(""), 3500);
      return;
    }

    try {
      setSending(true);
      setSendMsg("");
      const res = await axios.post(
        `${API_URL}/api/capsules/${capsule._id}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 25000,
        }
      );
      setSendMsg(`✅ ${res.data.message || `Sent to ${capsule.recipientEmail}!`}`);
      setTimeout(() => setSendMsg(""), 4000);
    } catch (err) {
      console.error("Send error:", err);
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setSendMsg("⚠️ Server took too long to respond. It may be waking up, please try once more!");
      } else {
        setSendMsg(
          `❌ ${err.response?.data?.error || err.message || "Failed to send email"}`
        );
      }
      setTimeout(() => setSendMsg(""), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Real Send to Recipient Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSendToRecipient}
          disabled={sending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-105 transition disabled:opacity-60"
        >
          {sending ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="text-xs" />
              <span>Send to Recipient</span>
            </>
          )}
        </motion.button>

        {/* WhatsApp Direct Link */}
        <motion.a
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          href={`https://wa.me/?text=${encodeURIComponent(
            `Hi! I created a Digital Time Capsule for you: "${capsule.title || "Time Capsule"}". View it here: ${shareUrl}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-500 transition"
        >
          <FaWhatsapp className="text-sm" /> WhatsApp
        </motion.a>

        {/* Copy Direct Link */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => safeCopy(shareUrl)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold shadow hover:bg-slate-700 transition"
        >
          {copied ? <FaCheck className="text-emerald-400 text-sm" /> : <FaLink className="text-sm" />}
          <span>{copied ? "Link Copied!" : "Copy Link"}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {sendMsg && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-xs font-semibold px-3 py-2 rounded-xl border mt-2 leading-relaxed ${
              sendMsg.startsWith("❌")
                ? "text-rose-300 bg-rose-950/40 border-rose-500/30"
                : "text-emerald-300 bg-emerald-950/40 border-emerald-500/30"
            }`}
          >
            {sendMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
