import api from "./api";

export const createBooking = (payload) => api.post("/bookings", payload);
export const getMyBookings = () => api.get("/bookings/my");
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const payBooking = (id, payload = {}) => api.put(`/bookings/${id}/pay`, payload);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);