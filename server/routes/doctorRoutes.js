import { Router } from "express";
import {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  updateAvailability,
  verifyDoctor,
  deleteDoctor,
  getDoctorStats,
  getMyProfile,
} from "../controllers/doctorController.js";
import { protect, restrictTo }        from "../middlewares/authMiddleware.js";
import { validate, doctorValidation } from "../middlewares/validateMiddleware.js";

const router = Router();

router.get("/", getAllDoctors);

router.use(protect);

router.get("/admin/stats",  restrictTo("Admin"),  getDoctorStats);
router.get("/my-profile",   restrictTo("Doctor"), getMyProfile);

router.post("/", restrictTo("Admin"), doctorValidation.add, validate, addDoctor);

router.patch("/:id",              restrictTo("Admin", "Doctor"), doctorValidation.update,       validate, updateDoctor);
router.patch("/:id/availability", restrictTo("Admin", "Doctor"), doctorValidation.availability, validate, updateAvailability);
router.patch("/:id/verify",       restrictTo("Admin"), verifyDoctor);
router.delete("/:id",             restrictTo("Admin"), deleteDoctor);

router.get("/:id", getDoctorById);

export default router;
