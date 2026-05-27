import { Router } from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/",             getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all",   markAllAsRead);
router.delete("/",          clearAllNotifications);
router.patch("/:id/read",   markAsRead);
router.delete("/:id",       deleteNotification);

export default router;
