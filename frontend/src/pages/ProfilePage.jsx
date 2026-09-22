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
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
      <div className="glass-panel w-full max-w-2xl rounded-[30px] p-7 sm:p-8">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-rose-400 text-2xl shadow-lg shadow-amber-600/20">
            👤
          </div>
          <h1 className="text-3xl font-black text-gradient">Profile</h1>
        </div>

        {editMode ? (
          <div className="space-y-3">
            <input
              className="theme-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              className="theme-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-xl font-semibold text-slate-100">{user.name}</p>
            <p className="text-slate-300">{user.email}</p>
          </div>
        )}

        <p className="mt-6 text-center text-lg text-slate-200">
          Total Capsules: <span className="font-bold text-amber-300">{capsules.length}</span>
        </p>

        <div className="mt-7 flex flex-col justify-center gap-4 md:flex-row">
          {editMode ? (
            <button
              onClick={handleUpdate}
              className="theme-button-primary flex-1 px-6 py-3"
            >
              💾 Update
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="theme-button-secondary flex-1 px-6 py-3"
            >
              ✏️ Edit
            </button>
          )}

          <button
            onClick={handleDelete}
            className="flex-1 rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-400"
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
