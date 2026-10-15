import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ids, setIds] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- Load wishlist whenever user changes ---------- */
  const load = useCallback(async () => {
    if (!user) {
      setIds([]);
      setHotels([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/wishlist");
      setIds(data.ids || []);
      setHotels(data.hotels || []);
    } catch {
      setIds([]);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- Toggle ---------- */
  const toggle = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }

    // optimistic update
    setIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );

    try {
      const { data } = await api.post(`/wishlist/${id}`);
      setIds(data.ids || []);
      setHotels(data.hotels || []);
    } catch {
      load(); // revert on failure
    }
  };

  const isWished = (id) => ids.includes(id);

  return (
    <WishlistContext.Provider
      value={{ ids, hotels, loading, toggle, isWished, reload: load }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);