import axios from "axios";

/**
 * In development, Vite proxies /api → localhost:5000 (vite.config.js).
 * In production, VITE_API_URL must be set to the deployed backend URL
 * e.g. https://mediflow-api.onrender.com
 */
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor – extract error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred.";
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post("/auth/register/patient", data),
  login:          (data) => api.post("/auth/login", data),
  logout:         ()     => api.get("/auth/logout"),
  getMe:          ()     => api.get("/auth/me"),
  updatePassword: (data) => api.patch("/auth/update-password", data),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const doctorAPI = {
  getAll:  (params) => api.get("/doctors", { params }),
  getById: (id)     => api.get(`/doctors/${id}`),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentAPI = {
  book:   (data) => api.post("/appointments", data),
  getMine: ()    => api.get("/appointments/my"),
  cancel: (id)   => api.patch(`/appointments/${id}/cancel`),
};

// ─── Departments ──────────────────────────────────────────────────────────────
export const departmentAPI = {
  getAll: () => api.get("/departments"),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messageAPI = {
  send: (data) => api.post("/messages", data),
};

export default api;
