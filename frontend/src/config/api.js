// Centralized API URL resolution
const isBrowser = typeof window !== "undefined";
const isLocalhost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (!isLocalhost
    ? "https://digital-time-capsule-2-ten.vercel.app"
    : "http://localhost:5000");

export default API_URL;
