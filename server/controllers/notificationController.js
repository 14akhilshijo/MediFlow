import { Notification } from "../models/Notification.js";
import { AppError }      from "../utils/AppError.js";
import asyncHandler      from "../middlewares/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    total,
    unreadCount,
    page,
    pages: Math.ceil(total / limit),
    notifications,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead:    false,
  });

  res.status(200).json({ success: true, unreadCount: count });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) return next(new AppError("Notification not found.", 404));

  res.status(200).json({ success: true, notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ success: true, message: "All notifications marked as read." });
});

export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id:       req.params.id,
    recipient: req.user._id,
  });

  if (!notification) return next(new AppError("Notification not found.", 404));

  res.status(200).json({ success: true, message: "Notification deleted." });
});

export const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.status(200).json({ success: true, message: "All notifications cleared." });
});
