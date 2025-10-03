// src/components/ShareOptions.jsx
import { FaWhatsapp, FaEnvelope, FaLink, FaDownload } from "react-icons/fa";

/**
 * ShareOptions Component
 * @param {string} shareUrl - URL to be shared
 * @param {object} capsule - Capsule data for download
 */
export default function ShareOptions({ shareUrl, capsule }) {
  // Copy to clipboard with fallback
  const safeCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied to clipboard!");
    } catch {
      const tmp = document.createElement("input");
      document.body.appendChild(tmp);
      tmp.value = text;
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      alert("Link copied (fallback)!");
    }
  };

  // Download capsule as text
  const handleDownload = () => {
    const unlockDateStr = capsule.unlockDate
      ? new Date(capsule.unlockDate).toLocaleString()
      : "N/A";

    let content = `Title: ${capsule.title || "Untitled"}\n`;
    content += `Unlock Date: ${unlockDateStr}\n\n`;
    content += `Message:\n${capsule.message || ""}\n`;

    if (capsule.attachments && capsule.attachments.length > 0) {
      content += `\nAttachments:\n${capsule.attachments.join("\n")}\n`;
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

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white font-medium shadow hover:bg-green-600 transition"
      >
        <FaWhatsapp /> WhatsApp
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent("Check this Time Capsule")}&body=${encodeURIComponent(shareUrl)}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
      >
        <FaEnvelope /> Email
      </a>

      <button
        onClick={() => safeCopy(shareUrl)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 text-white font-medium shadow hover:bg-gray-800 transition"
      >
        <FaLink /> Copy Link
      </button>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
      >
        <FaDownload /> Download
      </button>
    </div>
  );
}
