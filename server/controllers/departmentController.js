import { Department } from "../models/Department.js";
import { AppError } from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// ─── Create Department (Admin) ────────────────────────────────────────────────
export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, message: "Department created.", department });
});

// ─── Get All Departments (Public) ────────────────────────────────────────────
export const getAllDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.find({ isActive: true }).sort("name");
  res.status(200).json({ success: true, count: departments.length, departments });
});

// ─── Update Department (Admin) ────────────────────────────────────────────────
export const updateDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) return next(new AppError("Department not found.", 404));
  res.status(200).json({ success: true, message: "Department updated.", department });
});

// ─── Delete Department (Admin) ────────────────────────────────────────────────
export const deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) return next(new AppError("Department not found.", 404));
  res.status(200).json({ success: true, message: "Department deleted." });
});
