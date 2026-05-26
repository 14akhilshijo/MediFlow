import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
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
  /** GET /doctors – all doctors (admin sees unverified too) */
  getAll:   (params) => api.get("/doctors", { params }),

  /** GET /doctors/:id */
  getById:  (id) => api.get(`/doctors/${id}`),

  /** POST /doctors – multipart/form-data */
  add: (data) =>
    api.post("/doctors", data, { headers: { "Content-Type": "multipart/form-data" } }),

  /** PATCH /doctors/:id – multipart/form-data (avatar optional) */
  update: (id, data) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/doctors/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
  },

  /** PATCH /doctors/:id/availability */
  updateAvailability: (id, slots) =>
    api.patch(`/doctors/${id}/availability`, { availableSlots: slots }),

  /** PATCH /doctors/:id/verify */
  verify: (id) => api.patch(`/doctors/${id}/verify`),

  /** DELETE /doctors/:id */
  delete: (id) => api.delete(`/doctors/${id}`),

  /** GET /doctors/admin/stats */
  getStats: () => api.get("/doctors/admin/stats"),
};

// ─── Appointment API ──────────────────────────────────────────────────────────
export const adminAppointmentAPI = {
  getAll:       (params) => api.get("/appointments", { params }),
  getStats:     ()       => api.get("/appointments/stats"),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
};

// ─── Message API ──────────────────────────────────────────────────────────────
export const adminMessageAPI = {
  getAll:   ()    => api.get("/messages"),
  markRead: (id)  => api.patch(`/messages/${id}/read`),
  delete:   (id)  => api.delete(`/messages/${id}`),
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
  getAll:     ()    => api.get("/users"),
  deactivate: (id)  => api.patch(`/users/${id}/deactivate`),
  delete:     (id)  => api.delete(`/users/${id}`),
};

export default api;
