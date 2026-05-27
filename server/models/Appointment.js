import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Patient is required"],
    },
    doctor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Doctor",
      required: [true, "Doctor is required"],
    },
    department: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Department",
      required: [true, "Department is required"],
    },
    appointmentDate: {
      type:     Date,
      required: [true, "Appointment date is required"],
    },
    timeSlot: {
      type:     String,
      required: [true, "Time slot is required"],
      trim:     true,
    },
    type: {
      type:    String,
      enum:    {
        values:  ["In-Person", "Video", "Phone"],
        message: "Type must be In-Person, Video, or Phone",
      },
      default: "In-Person",
    },
    reason: {
      type:      String,
      required:  [true, "Reason for appointment is required"],
      trim:      true,
      maxLength: [500, "Reason cannot exceed 500 characters"],
    },
    notes: {
      type:      String,
      trim:      true,
      maxLength: [1000, "Notes cannot exceed 1000 characters"],
    },
    prescription: {
      type:      String,
      trim:      true,
      maxLength: [2000, "Prescription cannot exceed 2000 characters"],
    },
    status: {
      type:    String,
      enum:    {
        values:  ["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"],
        message: "Invalid status value",
      },
      default: "Pending",
    },
    fee: {
      type:     Number,
      required: [true, "Fee is required"],
      min:      [0, "Fee cannot be negative"],
    },
    paymentStatus: {
      type:    String,
      enum:    ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
