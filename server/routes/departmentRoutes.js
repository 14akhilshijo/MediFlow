import { Router } from "express";
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

// Public
router.get("/", getAllDepartments);

// Admin only
router.use(protect, restrictTo("Admin"));
router.post("/", createDepartment);
router.patch("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
