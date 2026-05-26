/**
 * Doctor Routes
 *
 * Base path: /api/v1/doctors
 *
 * Public:
 *   GET    /           – List all verified doctors (paginated, filterable)
 *   GET    /:id        – Get single doctor by ID
 *
 * Protected (JWT required):
 *   POST   /           – Add doctor          [Admin]
 *   PATCH  /:id        – Update doctor       [Admin, Doctor]
 *   PATCH  /:id/availability – Update schedule [Admin, Doctor]
 *   PATCH  /:id/verify – Verify doctor       [Admin]
 *   DELETE /:id        – Delete doctor       [Admin]
 *   GET    /stats      – Aggregate stats     [Admin]
 */

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
} from "../controllers/doctorController.js";
import { protect, restrictTo }          from "../middlewares/authMiddleware.js";
import { validate, doctorValidation }   from "../middlewares/validateMiddleware.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// ── Protected ─────────────────────────────────────────────────────────────────
router.use(protect);

router.get("/admin/stats", restrictTo("Admin"), getDoctorStats);

router.post(
  "/",
  restrictTo("Admin"),
  doctorValidation.add,
  validate,
  addDoctor
);

router.patch(
  "/:id",
  restrictTo("Admin", "Doctor"),
  doctorValidation.update,
  validate,
  updateDoctor
);

router.patch(
  "/:id/availability",
  restrictTo("Admin", "Doctor"),
  doctorValidation.availability,
  validate,
  updateAvailability
);

router.patch("/:id/verify",  restrictTo("Admin"), verifyDoctor);
router.delete("/:id",        restrictTo("Admin"), deleteDoctor);

export default router;
