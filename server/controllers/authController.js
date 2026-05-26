/**
 * Auth Controller
 *
 * Handles all authentication flows:
 *   POST   /auth/register/patient   – Public patient self-registration
 *   POST   /auth/register/admin     – Admin-only: create another admin
 *   POST   /auth/register/doctor    – Admin-only: create a doctor account
 *   POST   /auth/login              – Login for all roles
 *   GET    /auth/logout             – Clear auth cookie
 *   GET    /auth/me                 – Get current authenticated user
 *   PATCH  /auth/update-password    – Change password (authenticated)
 *   POST   /auth/forgot-password    – Request password reset token
 *   PATCH  /auth/reset-password/:token – Reset password with token
 */

import crypto from "crypto";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { AppError } from "../utils/AppError.js";
import { sendToken } from "../utils/sendToken.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// ─── Helper: sanitize user output ─────────────────────────────────────────────
const sanitizeUser = (user) => {
  const obj = user.toObject({ virtuals: true });
  delete obj.password;
  delete obj.passwordChangedAt;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @desc    Register a new patient
 * @route   POST /api/v1/auth/register/patient
 * @access  Public
 */
export const registerPatient = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob } = req.body;

  // Prevent duplicate accounts
  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("An account with this email already exists.", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    role: "Patient",
  });

  sendToken(user, 201, "Patient account created successfully.", res);
});

/**
 * @desc    Register a new admin (requires ADMIN_SECRET_KEY env var)
 * @route   POST /api/v1/auth/register/admin
 * @access  Admin only (verified via secret key OR existing admin session)
 */
export const registerAdmin = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, adminSecretKey } = req.body;

  // Verify the admin secret key
  if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
    return next(new AppError("Invalid admin secret key.", 403));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("An account with this email already exists.", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    role: "Admin",
  });

  sendToken(user, 201, "Admin account created successfully.", res);
});

/**
 * @desc    Register a new doctor (Admin only)
 * @route   POST /api/v1/auth/register/doctor
 * @access  Admin
 *
 * Creates both a User record (credentials) and a Doctor profile record.
 */
export const registerDoctor = asyncHandler(async (req, res, next) => {
  const {
    firstName, lastName, email, phone, password, gender, dob,
    department, specialization, qualifications,
    experience, bio, consultationFee,
  } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("An account with this email already exists.", 400));
  }

  // Build avatar from uploaded file if present
  const avatarPayload = {};
  if (req.files?.avatar) {
    const { uploadToCloudinary } = await import("../config/cloudinary.js");
    const { public_id, secure_url } = await uploadToCloudinary(
      req.files.avatar.tempFilePath,
      "mediflow/doctors"
    );
    avatarPayload.avatar = { public_id, url: secure_url };
  }

  // 1. Create user account
  const user = await User.create({
    firstName, lastName, email, phone, password, gender, dob,
    role: "Doctor",
    ...avatarPayload,
  });

  // 2. Create doctor profile
  const doctor = await Doctor.create({
    user:            user._id,
    department,
    specialization,
    qualifications:  qualifications ? JSON.parse(qualifications) : [],
    experience:      Number(experience),
    bio,
    consultationFee: Number(consultationFee),
  });

  res.status(201).json({
    success: true,
    message: "Doctor account created successfully.",
    user:    sanitizeUser(user),
    doctor,
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN / LOGOUT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @desc    Login – all roles
 * @route   POST /api/v1/auth/login
 * @access  Public
 *
 * Requires: email, password, role
 * Role must match the stored role to prevent cross-portal login.
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Fetch user with password (excluded by default)
  const user = await User.findOne({ email }).select("+password +passwordChangedAt");

  // Use a single generic message to prevent user enumeration
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password.", 401));
  }

  // Role mismatch – user exists but is trying the wrong portal
  if (user.role !== role) {
    return next(
      new AppError(`No ${role} account found with this email.`, 403)
    );
  }

  // Account deactivated
  if (!user.isActive) {
    return next(
      new AppError("Your account has been deactivated. Please contact support.", 403)
    );
  }

  sendToken(user, 200, `Welcome back, ${user.firstName}!`, res);
});

/**
 * @desc    Logout – clears the auth cookie
 * @route   GET /api/v1/auth/logout
 * @access  Protected
 */
export const logout = asyncHandler(async (_req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires:  new Date(0), // immediately expired
      secure:   process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json({ success: true, message: "Logged out successfully." });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT USER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/v1/auth/me
 * @access  Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached by protect middleware
  // Re-fetch to get the latest data (in case profile was updated)
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @desc    Update password (authenticated user)
 * @route   PATCH /api/v1/auth/update-password
 * @access  Protected
 *
 * Requires: currentPassword, newPassword, confirmPassword
 */
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Fetch with password field
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  // Prevent reusing the same password
  if (await user.comparePassword(newPassword)) {
    return next(new AppError("New password must be different from your current password.", 400));
  }

  user.password = newPassword;
  await user.save(); // triggers pre-save hook → hashes + sets passwordChangedAt

  sendToken(user, 200, "Password updated successfully.", res);
});

/**
 * @desc    Forgot password – generate reset token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 *
 * In production, this would email the reset link.
 * For now, the token is returned in the response (dev only).
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Always respond with 200 to prevent user enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // ── In production: send email with reset link ──────────────────────────────
  // const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  // await sendEmail({ to: user.email, subject: "Password Reset", resetURL });

  // ── Dev: return token in response ──────────────────────────────────────────
  res.status(200).json({
    success: true,
    message: "Password reset token generated.",
    ...(process.env.NODE_ENV === "development" && { resetToken }),
  });
});

/**
 * @desc    Reset password using token from email
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 *
 * Requires: password, confirmPassword (in body)
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Hash the URL token to compare with stored hash
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // not expired
  });

  if (!user) {
    return next(new AppError("Reset token is invalid or has expired.", 400));
  }

  // Set new password and clear reset fields
  user.password             = req.body.password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, "Password reset successful. You are now logged in.", res);
});
