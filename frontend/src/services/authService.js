import api from "./api";

export const sendSignupOtp = (payload) => api.post("/auth/send-otp", payload);
export const verifySignupOtp = (payload) => api.post("/auth/verify-otp", payload);

export const loginUser = (payload) => api.post("/auth/login", payload);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (payload) => api.put("/auth/profile", payload);
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });