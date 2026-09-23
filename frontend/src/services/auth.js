import axios from "axios";
import API_URL from "../config/api";

export const signup = (data) => axios.post(`${API_URL}/api/auth/signup`, data);
export const login = (data) => axios.post(`${API_URL}/api/auth/login`, data);
export const getProfile = (token) =>
  axios.get(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
