/**
 * Auth Routes
 *
 * Base path: /api/v1/auth
 *
 * Public:
 *   POST   /register/patient          – Patient self-registration
 *   POST   /register/admin            – Admin registration (secret key required)
 *   POST   /login                     – Login for all roles
 *   POST   /forgot-password           – Request password reset token
 *   PATCH  /reset-password/:token     – Reset password with token
 *
 * Protected (requires valid JWT):
 *   GET    /logout                    – Clear auth cookie
 *   GET    /me                        – Get current user profile
 *   PATCH  /update-password           – Change password
 *
 * Admin only:
 *   POST   /register/doctor           – Create a doctor account
 */

import { Router } from "express";
import {
  registerPatient,
  registerAdmin,
  registerDoctor,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { validate, validationRules } from "../middlewares/validateMiddleware.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

router.post(
  "/register/patient",
  validationRules.registerPatient,
  validate,
  registerPatient
);

router.post(
  "/register/admin",
  validationRules.registerAdmin,
  validate,
  registerAdmin
);

router.post(
  "/login",
  validationRules.login,
  validate,
  login
);

router.post(
  "/forgot-password",
  validationRules.forgotPassword,
  validate,
  forgotPassword
);

router.patch(
  "/reset-password/:token",
  validationRules.resetPassword,
  validate,
  resetPassword
);

// ─── Protected Routes (JWT required) ─────────────────────────────────────────

router.use(protect); // all routes below require authentication

router.get("/logout", logout);
router.get("/me",     getMe);

router.patch(
  "/update-password",
  validationRules.updatePassword,
  validate,
  updatePassword
);

// ─── Admin-only Routes ────────────────────────────────────────────────────────

router.post(
  "/register/doctor",
  restrictTo("Admin"),
  validationRules.registerDoctor,
  validate,
  registerDoctor
);

export default router;
