import crypto from "crypto";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { AppError } from "../utils/AppError.js";
import { sendToken } from "../utils/sendToken.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const sanitizeUser = (user) => {
  const obj = user.toObject({ virtuals: true });
  delete obj.password;
  delete obj.passwordChangedAt;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export const registerPatient = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("An account with this email already exists.", 400));
  }

  const user = await User.create({
    firstName, lastName, email, phone, password, gender, dob, role: "Patient",
  });

  sendToken(user, 201, "Patient account created successfully.", res);
});

export const registerAdmin = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, adminSecretKey } = req.body;

  if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
    return next(new AppError("Invalid admin secret key.", 403));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("An account with this email already exists.", 400));
  }

  const user = await User.create({
    firstName, lastName, email, phone, password, gender, dob, role: "Admin",
  });

  sendToken(user, 201, "Admin account created successfully.", res);
});

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

  const avatarPayload = {};
  if (req.files?.avatar) {
    const { uploadToCloudinary } = await import("../config/cloudinary.js");
    const { public_id, secure_url } = await uploadToCloudinary(
      req.files.avatar.tempFilePath,
      "mediflow/doctors"
    );
    avatarPayload.avatar = { public_id, url: secure_url };
  }

  const user = await User.create({
    firstName, lastName, email, phone, password, gender, dob,
    role: "Doctor",
    ...avatarPayload,
  });

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

export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email }).select("+password +passwordChangedAt");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password.", 401));
  }

  if (user.role !== role) {
    return next(new AppError(`No ${role} account found with this email.`, 403));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 403));
  }

  sendToken(user, 200, `Welcome back, ${user.firstName}!`, res);
});

export const logout = asyncHandler(async (_req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires:  new Date(0),
      secure:   process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json({ success: true, message: "Logged out successfully." });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  if (await user.comparePassword(newPassword)) {
    return next(new AppError("New password must be different from your current password.", 400));
  }

  user.password = newPassword;
  await user.save();

  sendToken(user, 200, "Password updated successfully.", res);
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Password reset token generated.",
    ...(process.env.NODE_ENV === "development" && { resetToken }),
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Reset token is invalid or has expired.", 400));
  }

  user.password             = req.body.password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, "Password reset successful. You are now logged in.", res);
});
