import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const total = await User.countDocuments();

  res.status(200).json({ success: true, total, count: users.length, users });
});

// ─── Get Single User ──────────────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));
  res.status(200).json({ success: true, user });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ["firstName", "lastName", "phone", "gender", "dob"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Handle avatar upload
  if (req.files?.avatar) {
    const user = await User.findById(req.user._id);
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }
    const { public_id, secure_url } = await uploadToCloudinary(
      req.files.avatar.tempFilePath,
      "mediflow/avatars"
    );
    updates.avatar = { public_id, url: secure_url };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: "Profile updated.", user });
});

// ─── Deactivate User (Admin) ──────────────────────────────────────────────────
export const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!user) return next(new AppError("User not found.", 404));
  res.status(200).json({ success: true, message: "User deactivated.", user });
});

// ─── Delete User (Admin) ──────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted." });
});
