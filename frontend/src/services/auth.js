import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const signup = (data) => axios.post(`${API_URL}/api/auth/signup`, data);
export const login = (data) => axios.post(`${API_URL}/api/auth/login`, data);
export const getProfile = (token) =>
  axios.get(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
