import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "An error occurred.";
    return Promise.reject(new Error(message));
  }
);

export const adminDoctorAPI = {
  getAll:  (params) => api.get("/doctors", { params }),
  getById: (id)     => api.get(`/doctors/${id}`),
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

export const adminAppointmentAPI = {
  getAll:       (params) => api.get("/appointments", { params }),
  getStats:     ()       => api.get("/appointments/stats"),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  getBookedSlots: (doctorId, date) =>
    api.get("/appointments/slots", { params: { doctorId, date } }),
};

export const adminMessageAPI = {
  getAll:   ()   => api.get("/messages"),
  markRead: (id) => api.patch(`/messages/${id}/read`),
  delete:   (id) => api.delete(`/messages/${id}`),
};

export const adminDepartmentAPI = {
  getAll:  ()         => api.get("/departments"),
  create:  (data)     => api.post("/departments", data),
  update:  (id, data) => api.patch(`/departments/${id}`, data),
  delete:  (id)       => api.delete(`/departments/${id}`),
};

export const adminUserAPI = {
  getAll:     ()   => api.get("/users"),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  delete:     (id) => api.delete(`/users/${id}`),
};

export const adminReportAPI = {
  getAll:       (params) => api.get("/reports", { params }),
  getStats:     ()       => api.get("/reports/stats"),
  getById:      (id)     => api.get(`/reports/${id}`),
  getByPatient: (id)     => api.get(`/reports/patient/${id}`),
  delete:       (id)     => api.delete(`/reports/${id}`),
};

export const analyticsAPI = {
  getOverview:        () => api.get("/analytics/overview"),
  getMonthlyTrend:    () => api.get("/analytics/monthly"),
  getStatusBreakdown: () => api.get("/analytics/status"),
  getDepartments:     () => api.get("/analytics/departments"),
  getTopDoctors:      () => api.get("/analytics/top-doctors"),
  getPatientGrowth:   () => api.get("/analytics/patient-growth"),
};

export default api;
