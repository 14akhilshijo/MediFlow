import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/me", { withCredentials: true });
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (credentials) => {
    const { data } = await axios.post("/api/v1/auth/login", credentials, {
      withCredentials: true,
    });
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post("/api/v1/auth/register/patient", formData, {
      withCredentials: true,
    });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await axios.get("/api/v1/auth/logout", { withCredentials: true });
    setUser(null);
  };

  const refreshUser = () => fetchUser();

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
