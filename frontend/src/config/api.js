// Centralized API URL resolution
const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

let rawUrl = (import.meta.env.VITE_API_URL || "").trim();

// Clean up any stray quotes or trailing slashes
rawUrl = rawUrl.replace(/^["']|["']$/g, "").replace(/\/+$/, "");

// Auto-prepend https:// if the user provided domain without protocol
if (rawUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}

export const API_URL =
  rawUrl ||
  (!isLocalhost
    ? "https://digital-time-capsule-2-ten.vercel.app"
    : "http://localhost:5000");

export default API_URL;
