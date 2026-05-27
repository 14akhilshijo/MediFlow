import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  deactivateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/",       restrictTo("Admin"), getAllUsers);
router.patch("/profile", updateProfile);
router.get("/:id",    restrictTo("Admin"), getUserById);
router.patch("/:id/deactivate", restrictTo("Admin"), deactivateUser);
router.delete("/:id", restrictTo("Admin"), deleteUser);

export default router;
