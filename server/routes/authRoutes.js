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

router.post("/register/patient", validationRules.registerPatient, validate, registerPatient);
router.post("/register/admin",   validationRules.registerAdmin,   validate, registerAdmin);
router.post("/login",            validationRules.login,           validate, login);
router.post("/forgot-password",  validationRules.forgotPassword,  validate, forgotPassword);
router.patch("/reset-password/:token", validationRules.resetPassword, validate, resetPassword);

router.use(protect);

router.get("/logout", logout);
router.get("/me",     getMe);
router.patch("/update-password", validationRules.updatePassword, validate, updatePassword);

router.post(
  "/register/doctor",
  restrictTo("Admin"),
  validationRules.registerDoctor,
  validate,
  registerDoctor
);

export default router;
