import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

/* ---------- Attach JWT ---------- */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hotele_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---------- Auto logout on 401 ---------- */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hotele_token");
      localStorage.removeItem("hotele_user");
    }
    return Promise.reject(error);
  }
);

export default api;