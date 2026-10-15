import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hotele_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  /* Restore session on mount */
  useEffect(() => {
    const token = localStorage.getItem("hotele_token");
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    getMe()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        localStorage.setItem("hotele_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("hotele_token");
        localStorage.removeItem("hotele_user");
        if (active) setUser(null);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const persist = (token, userData) => {
    localStorage.setItem("hotele_token", token);
    localStorage.setItem("hotele_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    persist(data.token, data.user);
    return data.user;
  };

  /* Used after OTP verification */
  const setSession = (token, userData) => {
    persist(token, userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("hotele_token");
    localStorage.removeItem("hotele_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, setSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);