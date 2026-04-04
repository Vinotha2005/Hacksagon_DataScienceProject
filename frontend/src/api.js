import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://hacksagon-datascienceproject.onrender.com";
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  }
});
export default api;