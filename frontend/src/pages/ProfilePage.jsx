import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [capsules, setCapsules] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } catch (err) {
        console.error("❌ Failed to load user:", err.message);
      }
    };

    const fetchCapsules = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/capsules", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCapsules(data);
      } catch (err) {
        console.error("❌ Failed to load capsules:", err.message);
      }
    };

    fetchUser();
    fetchCapsules();
  }, [token]);

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setUser(data.user); // data.user contains updated user
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      await fetch("http://localhost:5000/api/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      alert("Account deleted!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  if (!user) return <p className="text-center text-gray-400 mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-2xl mx-auto bg-zinc-800 rounded-2xl shadow-xl p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">👤 Profile</h1>

        {editMode ? (
          <div className="space-y-3">
            <input
              className="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              className="w-full p-2 rounded bg-zinc-700 text-white focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-lg text-white">Name: {user.name}</p>
            <p className="text-lg text-white">Email: {user.email}</p>
          </div>
        )}

        <p className="text-lg text-white mt-2">
          Total Capsules: <span className="font-semibold">{capsules.length}</span>
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
          {editMode ? (
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-400 transition"
            >
              💾 Update
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-400 transition"
            >
              ✏️ Edit
            </button>
          )}

          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-400 transition"
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
