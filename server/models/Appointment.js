import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"],
      default: "Pending",
    },
    type: {
      type: String,
      enum: ["In-Person", "Video", "Phone"],
      default: "In-Person",
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      maxLength: [300, "Reason cannot exceed 300 characters"],
    },
    notes: {
      type: String,
      maxLength: [1000, "Notes cannot exceed 1000 characters"],
    },
    prescription: {
      type: String,
    },
    fee: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
