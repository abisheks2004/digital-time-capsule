import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ShareOptions from "../components/ShareOptions";

export default function ShareCapsule() {
  const { shareLink } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const FRONTEND_URL = import.meta.env.FRONTEND_URL || "https://digital-time-capsule-five.vercel.app";

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/capsules/share/${shareLink}`);
        setCapsule(res.data.capsule);
        setError("");
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) setError("Capsule not found or not shared.");
        else if (err.response?.status === 403) setError("Capsule is locked until its unlock date.");
        else setError("Failed to load capsule.");
        setCapsule(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCapsule();
  }, [shareLink, API_URL]);

  if (loading) return <p className="text-center mt-10 text-xl">Loading capsule...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!capsule) return null;

  // Convert UTC date to local date string (IST or user timezone)
  const unlockDateLocal = new Date(capsule.unlockDate).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const isUnlocked = new Date(capsule.unlockDate) <= new Date();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl items-center justify-center px-4 py-8">
      <div className="glass-panel w-full rounded-[30px] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = "/"))}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition text-sm"
              title="Back"
            >
              ←
            </button>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isUnlocked ? "text-amber-300" : "text-rose-300"}`}>
                {isUnlocked ? "Unlocked" : "Locked"}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-gradient">
                {isUnlocked ? "Time Capsule 🔓" : "Time Capsule 🔒"}
              </h1>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            {unlockDateLocal}
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-slate-100">{capsule.title || "Time Capsule"}</h2>

        <p className="mb-5 break-words text-lg leading-8 text-slate-200">
          {isUnlocked
            ? capsule.message
            : `This capsule is locked until ${unlockDateLocal}`}
        </p>

        {isUnlocked && capsule.attachments?.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Attachments</h3>
            <ul className="space-y-2 text-slate-200">
              {capsule.attachments.map((file, idx) => (
                <li key={idx}>
                  <a href={file} target="_blank" rel="noopener noreferrer" className="text-amber-300 underline-offset-4 hover:underline">
                    {file.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isUnlocked && (
          <ShareOptions
            shareUrl={`${FRONTEND_URL}/capsule/share/${capsule.shareLink || capsule._id}`}
            capsule={capsule}
          />
        )}
      </div>
    </div>
  );
}
