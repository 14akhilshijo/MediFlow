/**
 * User Model
 *
 * Single collection for all roles: Patient | Doctor | Admin
 *
 * Security features:
 *  - Password hashed with bcryptjs (cost 12) via pre-save hook
 *  - Password field excluded from all queries by default (select: false)
 *  - passwordChangedAt tracked to invalidate old JWTs after password change
 *  - Password reset token stored as SHA-256 hash, never plain-text
 */

import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

// ─── Schema ───────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    firstName: {
      type:      String,
      required:  [true, "First name is required"],
      trim:      true,
      minLength: [2,  "First name must be at least 2 characters"],
      maxLength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type:      String,
      required:  [true, "Last name is required"],
      trim:      true,
      minLength: [2,  "Last name must be at least 2 characters"],
      maxLength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      validate:  [validator.isEmail, "Please provide a valid email address"],
    },
    phone: {
      type:      String,
      required:  [true, "Phone number is required"],
      minLength: [10, "Phone number must be at least 10 digits"],
      maxLength: [15, "Phone number cannot exceed 15 digits"],
    },

    // ── Credentials ───────────────────────────────────────────────────────────
    password: {
      type:      String,
      required:  [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      select:    false, // excluded from all queries unless explicitly requested
    },
    passwordChangedAt: {
      type:   Date,
      select: false,
    },
    passwordResetToken: {
      type:   String,
      select: false,
    },
    passwordResetExpires: {
      type:   Date,
      select: false,
    },

    // ── Profile ───────────────────────────────────────────────────────────────
    gender: {
      type:     String,
      enum:     {
        values:  ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
      required: [true, "Gender is required"],
    },
    dob: {
      type:     Date,
      required: [true, "Date of birth is required"],
    },
    avatar: {
      public_id: { type: String, default: "" },
      url:       { type: String, default: "" },
    },

    // ── Access Control ────────────────────────────────────────────────────────
    role: {
      type:    String,
      enum:    {
        values:  ["Patient", "Doctor", "Admin"],
        message: "Role must be Patient, Doctor, or Admin",
      },
      default: "Patient",
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

/** "John Doe" */
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/** Calculated age from dob */
userSchema.virtual("age").get(function () {
  if (!this.dob) return null;
  const today = new Date();
  const birth  = new Date(this.dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash with cost factor 12 (~250ms on modern hardware)
  this.password = await bcrypt.hash(this.password, 12);

  // Track when password changed so old JWTs can be invalidated
  if (!this.isNew) {
    // Subtract 1 second to account for DB write latency vs JWT iat
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plain-text candidate password against the stored bcrypt hash.
 * @param   {string}  enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Sign and return a JWT for this user.
 * Payload: { id, role }
 * @returns {string}
 */
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
};

/**
 * Returns true if the user changed their password AFTER the given JWT was issued.
 * Used in protect middleware to reject tokens issued before a password reset.
 * @param   {number}  jwtIat  - JWT iat claim (seconds since Unix epoch)
 * @returns {boolean}
 */
userSchema.methods.passwordChangedAfter = function (jwtIat) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return changedTimestamp > jwtIat;
  }
  return false;
};

/**
 * Generate a secure password reset token.
 * Stores the SHA-256 hash on the document (caller must save()).
 * Returns the plain-text token to be sent to the user via email.
 * @returns {string} plain-text reset token
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Store only the hash — never the raw token
  this.passwordResetToken   = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
