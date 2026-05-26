import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await axios.get("/api/v1/auth/me", { withCredentials: true });
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
    const { data } = await axios.post(
      "/api/v1/auth/login",
      { ...credentials, role: "Admin" },
      { withCredentials: true }
    );
    if (data.user?.role !== "Admin") throw new Error("Access denied. Admins only.");
    setAdmin(data.user);
    return data;
  };

  const logout = async () => {
    await axios.get("/api/v1/auth/logout", { withCredentials: true });
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
