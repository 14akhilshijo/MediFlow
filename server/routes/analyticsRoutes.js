import { Router } from "express";
import {
  getOverview,
  getMonthlyTrend,
  getStatusBreakdown,
  getDepartmentBreakdown,
  getTopDoctors,
  getPatientGrowth,
} from "../controllers/analyticsController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect, restrictTo("Admin"));

router.get("/overview",       getOverview);
router.get("/monthly",        getMonthlyTrend);
router.get("/status",         getStatusBreakdown);
router.get("/departments",    getDepartmentBreakdown);
router.get("/top-doctors",    getTopDoctors);
router.get("/patient-growth", getPatientGrowth);

export default router;
