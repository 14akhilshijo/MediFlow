import { Router } from "express";
import {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getDashboardStats,
} from "../controllers/appointmentController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo("Patient"), bookAppointment);
router.get("/", restrictTo("Admin"), getAllAppointments);
router.get("/my", restrictTo("Patient"), getMyAppointments);
router.get("/doctor", restrictTo("Doctor"), getDoctorAppointments);
router.get("/stats", restrictTo("Admin"), getDashboardStats);
router.patch("/:id/status", restrictTo("Admin", "Doctor"), updateAppointmentStatus);
router.patch("/:id/cancel", restrictTo("Patient"), cancelAppointment);

export default router;
