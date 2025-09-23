import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CapsuleList from "../components/CapsuleList"; // ✅ make sure this exists

export default function Home() {
  const [user, setUser] = useState(null);
  const [capsules, setCapsules] = useState([]);
  const [sharedCapsules, setSharedCapsules] = useState([]); // 👈 shared capsules
  const [loading, setLoading] = useState(true);
  const [showCapsules, setShowCapsules] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err.message);
      }
    };

    const fetchCapsules = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/capsules", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCapsules(data.capsules || []);
      } catch (err) {
        console.error("❌ Failed to load capsules:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSharedCapsules = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/timecapsules/shared", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSharedCapsules(data);
      } catch (err) {
        console.error("❌ Failed to load shared capsules:", err.message);
      }
    };

    fetchUser();
    fetchCapsules();
    fetchSharedCapsules();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 p-6 space-y-8 relative">
      {/* User Card */}
      {user && (
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">{user.name}</h2>
            <p className="text-zinc-400">{user.email}</p>
          </div>
          <p className="text-zinc-300 text-sm">
            Total Capsules: <span className="font-semibold">{capsules.length}</span>
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/profile")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-400 transition"
            >
              👤 Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-400 transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <button
          onClick={() => navigate("/create")}
          className="bg-yellow-500 text-black py-6 rounded-xl font-bold text-lg shadow-md hover:bg-yellow-400 transition transform hover:scale-105"
        >
          ➕ Create Capsule
        </button>

        <button
          onClick={() => setShowCapsules(!showCapsules)}
          className="bg-red-500 text-white py-6 rounded-xl font-bold text-lg shadow-md hover:bg-red-400 transition transform hover:scale-105"
        >
          📦 My Capsules
        </button>

        {/* Dynamic Shared Capsules Dropdown */}
        <div className="relative">
          <button
            className="bg-green-500 text-white py-6 rounded-xl font-bold text-lg shadow-md hover:bg-green-400 transition transform hover:scale-105 w-full"
          >
            🌍 Shared Capsules
          </button>
          {sharedCapsules.length > 0 && (
            <div className="absolute mt-2 bg-zinc-800 shadow-lg rounded-lg w-64 z-50">
              {sharedCapsules.map((capsule) => (
                <button
                  key={capsule._id}
                  onClick={() => navigate(`/capsule/share/${capsule._id}`)}
                  className="block w-full text-left px-4 py-2 hover:bg-zinc-700 transition"
                >
                  {capsule.title || "Untitled Capsule"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render Capsules List */}
      {showCapsules && (
        <div className="mt-6">
          {loading ? (
            <p className="text-center text-zinc-400">Loading capsules...</p>
          ) : (
            <CapsuleList capsules={capsules} />
          )}
        </div>
      )}
    </div>
  );
}
