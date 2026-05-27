import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/adminApi.js";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data.user?.role === "Admin") {
          setAdmin(data.user);
        } else {
          setAdmin(null);
        }
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", {
      ...credentials,
      role: "Admin",
    });
    if (data.user?.role !== "Admin") throw new Error("Access denied. Admins only.");
    if (data.token) localStorage.setItem("adminToken", data.token);
    setAdmin(data.user);
    return data;
  };

  const logout = async () => {
    await api.get("/auth/logout");
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
