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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl">
      <h1 className={`text-2xl font-bold mb-4 ${isUnlocked ? "text-yellow-600" : "text-red-500"}`}>
        {isUnlocked ? "Unlocked Time Capsule 🔓" : "Locked Time Capsule 🔒"}
      </h1>

      <h2 className="text-xl font-semibold mb-2">{capsule.title || "Time Capsule"}</h2>

      <p className="mb-4 break-words text-lg">
        {isUnlocked
          ? capsule.message
          : `This capsule is locked until ${unlockDateLocal}`}
      </p>

      {isUnlocked && capsule.attachments?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Attachments:</h3>
          <ul className="list-disc list-inside">
            {capsule.attachments.map((file, idx) => (
              <li key={idx}>
                <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
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
  );
}
