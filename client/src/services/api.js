import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred.";
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register:       (data) => api.post("/auth/register/patient", data),
  login:          (data) => api.post("/auth/login", data),
  logout:         ()     => api.get("/auth/logout"),
  getMe:          ()     => api.get("/auth/me"),
  updatePassword: (data) => api.patch("/auth/update-password", data),
};

export const doctorAPI = {
  getAll:       (params) => api.get("/doctors", { params }),
  getById:      (id)     => api.get(`/doctors/${id}`),
  getMyProfile: ()       => api.get("/doctors/my-profile"),
  update:       (id, data) => api.patch(`/doctors/${id}`, data),
  updateAvailability: (id, slots) =>
    api.patch(`/doctors/${id}/availability`, { availableSlots: slots }),
};

export const appointmentAPI = {
  book:           (data)           => api.post("/appointments", data),
  getMine:        ()               => api.get("/appointments/my"),
  getDoctorAppts: ()               => api.get("/appointments/doctor"),
  cancel:         (id)             => api.patch(`/appointments/${id}/cancel`),
  updateStatus:   (id, data)       => api.patch(`/appointments/${id}/status`, data),
  getBookedSlots: (doctorId, date) =>
    api.get("/appointments/slots", { params: { doctorId, date } }),
};

export const departmentAPI = {
  getAll: () => api.get("/departments"),
};

export const messageAPI = {
  send: (data) => api.post("/messages", data),
};

export const reportAPI = {
  upload:  (formData, onUploadProgress) =>
    api.post("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),
  getMine: (params) => api.get("/reports/my", { params }),
  getById: (id)     => api.get(`/reports/${id}`),
  delete:  (id)     => api.delete(`/reports/${id}`),
};

export default api;
