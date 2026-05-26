import { Message } from "../models/Message.js";
import { AppError } from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// ─── Send Message (Public) ────────────────────────────────────────────────────
export const sendMessage = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body;

  const newMessage = await Message.create({
    firstName, lastName, email, phone, subject, message,
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully.",
    data: newMessage,
  });
});

// ─── Get All Messages (Admin) ─────────────────────────────────────────────────
export const getAllMessages = asyncHandler(async (_req, res) => {
  const messages = await Message.find().sort("-createdAt");
  res.status(200).json({ success: true, count: messages.length, messages });
});

// ─── Mark Message as Read (Admin) ────────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res, next) => {
  const msg = await Message.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!msg) return next(new AppError("Message not found.", 404));
  res.status(200).json({ success: true, message: "Marked as read.", data: msg });
});

// ─── Delete Message (Admin) ───────────────────────────────────────────────────
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const msg = await Message.findByIdAndDelete(req.params.id);
  if (!msg) return next(new AppError("Message not found.", 404));
  res.status(200).json({ success: true, message: "Message deleted." });
});
