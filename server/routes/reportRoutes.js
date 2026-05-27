import { Router } from "express";
import {
  uploadReport,
  getMyReports,
  getAllReports,
  getPatientReports,
  getReportById,
  deleteReport,
  getReportStats,
} from "../controllers/reportController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/",   restrictTo("Patient"),                    uploadReport);
router.get("/my",  restrictTo("Patient"),                    getMyReports);

router.get("/",            restrictTo("Admin"),               getAllReports);
router.get("/stats",       restrictTo("Admin"),               getReportStats);
router.get("/patient/:id", restrictTo("Admin", "Doctor"),     getPatientReports);

router.get("/:id",    restrictTo("Patient", "Admin", "Doctor"), getReportById);
router.delete("/:id", restrictTo("Patient", "Admin"),           deleteReport);

export default router;
