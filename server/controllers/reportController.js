import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { MedicalReport }    from "../models/MedicalReport.js";
import { AppError }         from "../utils/AppError.js";
import asyncHandler         from "../middlewares/asyncHandler.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const validateFile = (file, next) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return next(new AppError("Unsupported file type. Allowed: PDF, JPEG, PNG, WebP, GIF.", 415));
  }
  if (file.size > MAX_FILE_SIZE) {
    return next(new AppError("File size exceeds the 10 MB limit.", 413));
  }
  return true;
};

export const uploadReport = asyncHandler(async (req, res, next) => {
  if (!req.files?.report) {
    return next(new AppError("Please attach a file to upload.", 400));
  }

  const file = req.files.report;

  if (validateFile(file, next) !== true) return;

  const isImage        = file.mimetype.startsWith("image/");
  const cloudinaryType = isImage ? "image" : "raw";

  let cloudResult;
  try {
    cloudResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder:          `mediflow/reports/${req.user._id}`,
      resource_type:   cloudinaryType,
      use_filename:    true,
      unique_filename: true,
    });
  } catch (err) {
    return next(new AppError("File upload to cloud storage failed. Please try again.", 502));
  }

  const { title, description, category, appointment } = req.body;

  const report = await MedicalReport.create({
    patient:     req.user._id,
    appointment: appointment || null,
    title:       title?.trim() || path.basename(file.name, path.extname(file.name)),
    description: description?.trim() || "",
    category:    category || "Other",
    file: {
      public_id:    cloudResult.public_id,
      url:          cloudResult.secure_url,
      originalName: file.name,
      mimeType:     file.mimetype,
      size:         file.size,
      resourceType: cloudinaryType,
      format:       cloudResult.format || path.extname(file.name).replace(".", ""),
    },
  });

  res.status(201).json({
    success: true,
    message: "Report uploaded successfully.",
    report,
  });
});

export const getMyReports = asyncHandler(async (req, res) => {
  const { category, sort = "-createdAt" } = req.query;

  const filter = { patient: req.user._id, isDeleted: false };
  if (category && category !== "All") filter.category = category;

  const reports = await MedicalReport.find(filter)
    .populate("appointment", "appointmentDate timeSlot")
    .sort(sort)
    .lean({ virtuals: true });

  res.status(200).json({ success: true, count: reports.length, reports });
});

export const getAllReports = asyncHandler(async (req, res) => {
  const { category, sort = "-createdAt", page = 1, limit = 20 } = req.query;

  const filter = { isDeleted: false };
  if (category && category !== "All") filter.category = category;

  const skip = (Number(page) - 1) * Number(limit);

  const [reports, total] = await Promise.all([
    MedicalReport.find(filter)
      .populate("patient", "firstName lastName email")
      .populate("appointment", "appointmentDate timeSlot")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean({ virtuals: true }),
    MedicalReport.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, total, count: reports.length, reports });
});

export const getPatientReports = asyncHandler(async (req, res) => {
  const reports = await MedicalReport.find({ patient: req.params.id, isDeleted: false })
    .populate("appointment", "appointmentDate timeSlot")
    .sort("-createdAt")
    .lean({ virtuals: true });

  res.status(200).json({ success: true, count: reports.length, reports });
});

export const getReportById = asyncHandler(async (req, res, next) => {
  const report = await MedicalReport.findOne({ _id: req.params.id, isDeleted: false })
    .populate("patient", "firstName lastName email")
    .populate("appointment", "appointmentDate timeSlot")
    .lean({ virtuals: true });

  if (!report) return next(new AppError("Report not found.", 404));

  if (
    req.user.role === "Patient" &&
    report.patient._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You do not have permission to view this report.", 403));
  }

  res.status(200).json({ success: true, report });
});

export const deleteReport = asyncHandler(async (req, res, next) => {
  const report = await MedicalReport.findOne({ _id: req.params.id, isDeleted: false });

  if (!report) return next(new AppError("Report not found.", 404));

  if (
    req.user.role === "Patient" &&
    report.patient.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You do not have permission to delete this report.", 403));
  }

  try {
    await cloudinary.uploader.destroy(report.file.public_id, {
      resource_type: report.file.resourceType,
    });
  } catch {
    console.error(`Cloudinary delete failed for ${report.file.public_id}`);
  }

  report.isDeleted = true;
  await report.save();

  res.status(200).json({ success: true, message: "Report deleted successfully." });
});

export const getReportStats = asyncHandler(async (_req, res) => {
  const [total, byCategory] = await Promise.all([
    MedicalReport.countDocuments({ isDeleted: false }),
    MedicalReport.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({ success: true, stats: { total, byCategory } });
});
