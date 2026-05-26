import { Router } from "express";
import {
  sendMessage,
  getAllMessages,
  markAsRead,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

// Public – anyone can send a message
router.post("/", sendMessage);

// Admin only
router.use(protect, restrictTo("Admin"));
router.get("/", getAllMessages);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteMessage);

export default router;
