// src/components/ShareOptions.jsx
import { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaLink, FaDownload, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ShareOptions({ shareUrl, capsule }) {
  const [copied, setCopied] = useState(false);

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

  // Download capsule as text
  const handleDownload = () => {
    const unlockDateStr = capsule.unlockDate
      ? new Date(capsule.unlockDate).toLocaleString()
      : "N/A";

    let content = `Title: ${capsule.title || "Time Capsule"}\n`;
    content += `Recipient: ${capsule.recipientEmail || "N/A"}\n`;
    content += `Unlock Date: ${unlockDateStr}\n\n`;
    content += `Message:\n${capsule.message || ""}\n`;

    if (capsule.attachments && capsule.attachments.length > 0) {
      content += `\nAttachments:\n${capsule.attachments.map(a => a.name || a.fileName || a).join("\n")}\n`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(capsule.title || "timecapsule").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const emailSubject = encodeURIComponent(`Digital Time Capsule: ${capsule.title || "A capsule for you"}`);
  const emailBody = encodeURIComponent(
    `Hello,\n\nYou have received a Digital Time Capsule!\n\nTitle: ${capsule.title || "Time Capsule"}\nUnlock Link: ${shareUrl}\n\nOnce the unlock date arrives, you can open it directly using the link above.`
  );

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <motion.a
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        href={`https://wa.me/?text=${encodeURIComponent(`Check out this Digital Time Capsule: ${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-500 transition"
      >
        <FaWhatsapp className="text-sm" /> WhatsApp
      </motion.a>

      <motion.a
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        href={`mailto:${capsule.recipientEmail || ""}?subject=${emailSubject}&body=${emailBody}`}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-500 transition"
      >
        <FaEnvelope className="text-sm" /> Email
      </motion.a>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => safeCopy(shareUrl)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold shadow hover:bg-slate-700 transition"
      >
        {copied ? <FaCheck className="text-emerald-400 text-sm" /> : <FaLink className="text-sm" />}
        <span>{copied ? "Link Copied!" : "Copy Link"}</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/80 border border-indigo-500/40 text-indigo-100 text-xs font-semibold shadow hover:bg-indigo-600 transition"
      >
        <FaDownload className="text-sm" /> Download
      </motion.button>
    </div>
  );
}
