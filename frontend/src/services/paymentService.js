import api from "./api";

export const createRazorpayOrder = (bookingId) =>
  api.post("/payment/create-order", { bookingId });

export const verifyRazorpayPayment = (payload) =>
  api.post("/payment/verify", payload);

export const getRazorpayKey = () => api.get("/payment/key");