import { Notification } from "../models/Notification.js";

export const createNotification = async ({ recipient, type, title, message, relatedId }) => {
  try {
    await Notification.create({ recipient, type, title, message, relatedId });
  } catch (err) {
    console.error("[Notification] Failed to create:", err.message);
  }
};

export const createNotifications = async (recipients, opts) => {
  await Promise.allSettled(
    recipients.map((recipient) => createNotification({ recipient, ...opts }))
  );
};
