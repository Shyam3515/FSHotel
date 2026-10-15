import api from "./api";

export const getWishlist = () => api.get("/wishlist");
export const toggleWishlist = (hotelId) => api.post(`/wishlist/${hotelId}`);