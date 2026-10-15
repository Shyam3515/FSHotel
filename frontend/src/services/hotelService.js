import api from "./api";

export const fetchHotels = (params = {}) => api.get("/hotels", { params });
export const fetchHotel = (id) => api.get(`/hotels/${id}`);
export const fetchDestinations = () => api.get("/hotels/destinations");