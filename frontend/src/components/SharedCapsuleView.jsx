import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharedCapsuleView() {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [lockedMessage, setLockedMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLockedMessage("Invalid or missing capsule link");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/api/capsules/share/${id}`)
      .then((res) => {
        const data = res.data;
        const isUnlocked = new Date(data.unlockDate) <= new Date();

        if (!isUnlocked) {
          setLockedMessage(`🔒 Locked until ${new Date(data.unlockDate).toLocaleString()}`);
        } else {
          setCapsule(data);
        }
      })
      .catch(() => setLockedMessage("❌ Capsule not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>⏳ Loading capsule...</p>;

  if (lockedMessage) {
    return <div className="p-4 bg-yellow-100 rounded">{lockedMessage}</div>;
  }

  return (
    <div className="p-4 bg-green-100 rounded space-y-2">
      <h1 className="font-bold text-xl mb-2">Unlocked Capsule 🔓</h1>
      <p>{capsule.message}</p>

      {capsule.attachments?.map((file, idx) => (
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
    </div>
  );
}
