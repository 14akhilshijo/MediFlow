/**
 * Doctor Model
 *
 * Linked to a User document (role: "Doctor") via the `user` ref.
 * Stores all professional data: department, specialization, qualifications,
 * experience, fees, availability schedule, and rating aggregates.
 *
 * Indexes:
 *   - department + isVerified  → department-filtered listings
 *   - user (unique)            → one doctor profile per user account
 */

import mongoose from "mongoose";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const qualificationSchema = new mongoose.Schema(
  {
    degree:      { type: String, required: [true, "Degree is required"], trim: true },
    institution: { type: String, required: [true, "Institution is required"], trim: true },
    year: {
      type:    Number,
      required: [true, "Graduation year is required"],
      min:     [1950, "Year must be 1950 or later"],
      max:     [new Date().getFullYear(), "Year cannot be in the future"],
    },
  },
  { _id: true }
);

const availableSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "Day is required"],
      enum: {
        values:  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        message: "Day must be a valid weekday",
      },
    },
    startTime: {
      type:     String,
      required: [true, "Start time is required"],
      match:    [/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type:     String,
      required: [true, "End time is required"],
      match:    [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
    },
    isAvailable: { type: Boolean, default: true },
    maxPatients: { type: Number, default: 10, min: [1, "Max patients must be at least 1"] },
  },
  { _id: true }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const doctorSchema = new mongoose.Schema(
  {
    // ── Relationships ─────────────────────────────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "User reference is required"],
      unique:   true,
    },
    department: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Department",
      required: [true, "Department is required"],
    },

    // ── Professional Details ──────────────────────────────────────────────────
    specialization: {
      type:     String,
      required: [true, "Specialization is required"],
      trim:     true,
      maxLength: [100, "Specialization cannot exceed 100 characters"],
    },
    qualifications: {
      type:    [qualificationSchema],
      default: [],
    },
    experience: {
      type:     Number,
      required: [true, "Experience is required"],
      min:      [0,  "Experience cannot be negative"],
      max:      [60, "Experience cannot exceed 60 years"],
    },
    bio: {
      type:      String,
      trim:      true,
      maxLength: [600, "Bio cannot exceed 600 characters"],
    },

    // ── Fees ─────────────────────────────────────────────────────────────────
    consultationFee: {
      type:     Number,
      required: [true, "Consultation fee is required"],
      min:      [0, "Fee cannot be negative"],
    },
    followUpFee: {
      type:    Number,
      default: 0,
      min:     [0, "Follow-up fee cannot be negative"],
    },

    // ── Availability ──────────────────────────────────────────────────────────
    availableSlots: {
      type:    [availableSlotSchema],
      default: [],
    },

    // ── Rating ────────────────────────────────────────────────────────────────
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
    },

    // ── Status ────────────────────────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isAcceptingPatients: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
doctorSchema.index({ department: 1, isVerified: 1 });
doctorSchema.index({ specialization: "text" });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

/** Days the doctor is available (unique, sorted) */
doctorSchema.virtual("availableDays").get(function () {
  const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const days  = [...new Set(this.availableSlots.map((s) => s.day))];
  return days.sort((a, b) => order.indexOf(a) - order.indexOf(b));
});

export const Doctor = mongoose.model("Doctor", doctorSchema);
