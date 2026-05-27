import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
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
    password: {
      type:      String,
      required:  [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      select:    false,
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

userSchema.index({ role: 1, isActive: 1 });

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
};

userSchema.methods.passwordChangedAfter = function (jwtIat) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return changedTimestamp > jwtIat;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken   = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
