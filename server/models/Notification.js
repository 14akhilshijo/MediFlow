import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Recipient is required"],
      index:    true,
    },
    type: {
      type:    String,
      enum:    {
        values: [
          "appointment_booked",
          "appointment_confirmed",
          "appointment_cancelled",
          "appointment_completed",
          "appointment_no_show",
          "general",
        ],
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
    },
    title: {
      type:      String,
      required:  [true, "Title is required"],
      trim:      true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type:      String,
      required:  [true, "Message is required"],
      trim:      true,
      maxLength: [500, "Message cannot exceed 500 characters"],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Appointment",
    },
    isRead: {
      type:    Boolean,
      default: false,
      index:   true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
