import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ShareOptions from "../components/ShareOptions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SharedCapsuleView() {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [lockedMessage, setLockedMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const shareUrl = `${window.location.origin}/capsule/share/${id}`;

  useEffect(() => {
    if (!id) {
      setLockedMessage("Invalid or missing time capsule link");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/api/timecapsules/share/${id}`)
      .then((res) => {
        const data = res.data;
        const isUnlocked = new Date(data.unlockDate) <= new Date();

        if (!isUnlocked) {
          setLockedMessage(
            `🔒 Locked until ${new Date(data.unlockDate).toLocaleString()}`
          );
        } 
        setCapsule(data); // store capsule even if locked
      })
      .catch(() => setLockedMessage("❌ Time capsule not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>⏳ Loading time capsule...</p>;

  return (
    <div className="p-4 bg-green-100 rounded space-y-4">
      {lockedMessage ? (
        <div className="p-4 bg-yellow-100 rounded">{lockedMessage}</div>
      ) : (
        <>
          <h1 className="font-bold text-xl mb-2">Unlocked Time Capsule 🔓</h1>
          <p>{capsule?.message}</p>

          {capsule?.attachments?.map((file, idx) => (
            <a
              key={file._id || idx}
              href={`data:${file.fileType};base64,${file.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 underline"
            >
              📎 {file.fileName}
            </a>
          ))}
        </>
      )}

      {capsule && <ShareOptions shareUrl={shareUrl} capsule={capsule} />}
    </div>
  );
}
