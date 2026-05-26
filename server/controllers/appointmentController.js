import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { AppError } from "../utils/AppError.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// ─── Book Appointment (Patient) ───────────────────────────────────────────────
export const bookAppointment = asyncHandler(async (req, res, next) => {
  const { doctor: doctorId, appointmentDate, timeSlot, type, reason } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return next(new AppError("Doctor not found.", 404));
  if (!doctor.isVerified) return next(new AppError("Doctor is not verified.", 400));

  // Check for conflicting appointment
  const conflict = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    timeSlot,
    status: { $in: ["Pending", "Confirmed"] },
  });
  if (conflict) return next(new AppError("This time slot is already booked.", 409));

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    department: doctor.department,
    appointmentDate,
    timeSlot,
    type,
    reason,
    fee: doctor.consultationFee,
  });

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully.",
    appointment,
  });
});

// ─── Get All Appointments (Admin) ─────────────────────────────────────────────
export const getAllAppointments = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Appointment.find()
      .populate("patient", "firstName lastName email phone")
      .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName" } })
      .populate("department", "name"),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const appointments = await features.query;
  const total = await Appointment.countDocuments();

  res.status(200).json({ success: true, total, count: appointments.length, appointments });
});

// ─── Get My Appointments (Patient) ───────────────────────────────────────────
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate({ path: "doctor", populate: { path: "user", select: "firstName lastName avatar" } })
    .populate("department", "name")
    .sort("-appointmentDate");

  res.status(200).json({ success: true, count: appointments.length, appointments });
});

// ─── Get Doctor's Appointments ────────────────────────────────────────────────
export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) return;

  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate("patient", "firstName lastName email phone dob gender")
    .sort("appointmentDate");

  res.status(200).json({ success: true, count: appointments.length, appointments });
});

// ─── Update Appointment Status ────────────────────────────────────────────────
export const updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const { status, notes, prescription } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status, notes, prescription },
    { new: true, runValidators: true }
  );

  if (!appointment) return next(new AppError("Appointment not found.", 404));
  res.status(200).json({ success: true, message: "Appointment updated.", appointment });
});

// ─── Cancel Appointment (Patient) ────────────────────────────────────────────
export const cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patient: req.user._id,
  });

  if (!appointment) return next(new AppError("Appointment not found.", 404));
  if (appointment.status === "Completed") {
    return next(new AppError("Cannot cancel a completed appointment.", 400));
  }

  appointment.status = "Cancelled";
  await appointment.save();

  res.status(200).json({ success: true, message: "Appointment cancelled.", appointment });
});

// ─── Dashboard Stats (Admin) ──────────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "Pending" }),
    Appointment.countDocuments({ status: "Confirmed" }),
    Appointment.countDocuments({ status: "Completed" }),
    Appointment.countDocuments({ status: "Cancelled" }),
  ]);

  res.status(200).json({
    success: true,
    stats: { total, pending, confirmed, completed, cancelled },
  });
});
