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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "An error occurred.";
    return Promise.reject(new Error(message));
  }
);

// ─── Doctor API ───────────────────────────────────────────────────────────────
export const adminDoctorAPI = {
  getAll:   (params) => api.get("/doctors", { params }),
  getById:  (id)     => api.get(`/doctors/${id}`),
  add: (data) =>
    api.post("/doctors", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, data) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/doctors/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
  },
  updateAvailability: (id, slots) =>
    api.patch(`/doctors/${id}/availability`, { availableSlots: slots }),
  verify:   (id) => api.patch(`/doctors/${id}/verify`),
  delete:   (id) => api.delete(`/doctors/${id}`),
  getStats: ()   => api.get("/doctors/admin/stats"),
};

// ─── Appointment API ──────────────────────────────────────────────────────────
export const adminAppointmentAPI = {
  getAll:       (params) => api.get("/appointments", { params }),
  getStats:     ()       => api.get("/appointments/stats"),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
};

// ─── Message API ──────────────────────────────────────────────────────────────
export const adminMessageAPI = {
  getAll:   ()   => api.get("/messages"),
  markRead: (id) => api.patch(`/messages/${id}/read`),
  delete:   (id) => api.delete(`/messages/${id}`),
};

// ─── Department API ───────────────────────────────────────────────────────────
export const adminDepartmentAPI = {
  getAll:  ()         => api.get("/departments"),
  create:  (data)     => api.post("/departments", data),
  update:  (id, data) => api.patch(`/departments/${id}`, data),
  delete:  (id)       => api.delete(`/departments/${id}`),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const adminUserAPI = {
  getAll:     ()   => api.get("/users"),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  delete:     (id) => api.delete(`/users/${id}`),
};

export default api;
