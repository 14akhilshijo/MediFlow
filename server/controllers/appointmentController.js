import { Appointment } from "../models/Appointment.js";
import { Doctor }      from "../models/Doctor.js";
import { AppError }    from "../utils/AppError.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import asyncHandler    from "../middlewares/asyncHandler.js";

const POPULATE_PATIENT = "firstName lastName email phone";
const POPULATE_DOCTOR  = { path: "doctor", populate: { path: "user", select: "firstName lastName avatar" } };

export const bookAppointment = asyncHandler(async (req, res, next) => {
  const { doctor: doctorId, appointmentDate, timeSlot, type, reason } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor)            return next(new AppError("Doctor not found.", 404));
  if (!doctor.isVerified) return next(new AppError("This doctor is not yet verified.", 400));
  if (!doctor.isAcceptingPatients) {
    return next(new AppError("This doctor is not currently accepting patients.", 400));
  }

  const apptDate = new Date(appointmentDate);
  if (apptDate < new Date()) {
    return next(new AppError("Appointment date must be in the future.", 400));
  }

  const conflict = await Appointment.findOne({
    doctor:          doctorId,
    appointmentDate: apptDate,
    timeSlot,
    status:          { $in: ["Pending", "Confirmed"] },
  });
  if (conflict) return next(new AppError("This time slot is already booked. Please choose another.", 409));

  const duplicate = await Appointment.findOne({
    patient:         req.user._id,
    doctor:          doctorId,
    appointmentDate: apptDate,
    status:          { $in: ["Pending", "Confirmed"] },
  });
  if (duplicate) {
    return next(new AppError("You already have an appointment with this doctor on this date.", 409));
  }

  const appointment = await Appointment.create({
    patient:         req.user._id,
    doctor:          doctorId,
    department:      doctor.department,
    appointmentDate: apptDate,
    timeSlot,
    type:            type || "In-Person",
    reason,
    fee:             doctor.consultationFee,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate("patient", POPULATE_PATIENT)
    .populate(POPULATE_DOCTOR)
    .populate("department", "name icon");

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully.",
    appointment: populated,
  });
});

export const getAllAppointments = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Appointment.find()
      .populate("patient", POPULATE_PATIENT)
      .populate(POPULATE_DOCTOR)
      .populate("department", "name"),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [appointments, total] = await Promise.all([
    features.query,
    Appointment.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    total,
    count: appointments.length,
    appointments,
  });
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate(POPULATE_DOCTOR)
    .populate("department", "name icon")
    .sort("-appointmentDate");

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

export const getDoctorAppointments = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) return next(new AppError("Doctor profile not found.", 404));

  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate("patient", "firstName lastName email phone dob gender")
    .populate("department", "name")
    .sort("appointmentDate");

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

export const updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const { status, notes, prescription } = req.body;

  const VALID_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"];
  if (status && !VALID_STATUSES.includes(status)) {
    return next(new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`, 400));
  }

  const updateData = {};
  if (status)       updateData.status       = status;
  if (notes)        updateData.notes        = notes;
  if (prescription) updateData.prescription = prescription;

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("patient", POPULATE_PATIENT)
    .populate(POPULATE_DOCTOR)
    .populate("department", "name");

  if (!appointment) return next(new AppError("Appointment not found.", 404));

  res.status(200).json({
    success: true,
    message: `Appointment ${status ? `marked as ${status}` : "updated"}.`,
    appointment,
  });
});

export const cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findOne({
    _id:     req.params.id,
    patient: req.user._id,
  });

  if (!appointment) return next(new AppError("Appointment not found.", 404));

  if (appointment.status === "Completed") {
    return next(new AppError("Cannot cancel a completed appointment.", 400));
  }
  if (appointment.status === "Cancelled") {
    return next(new AppError("Appointment is already cancelled.", 400));
  }

  appointment.status = "Cancelled";
  await appointment.save();

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully.",
    appointment,
  });
});

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [total, pending, confirmed, completed, cancelled, noShow] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "Pending" }),
    Appointment.countDocuments({ status: "Confirmed" }),
    Appointment.countDocuments({ status: "Completed" }),
    Appointment.countDocuments({ status: "Cancelled" }),
    Appointment.countDocuments({ status: "No-Show" }),
  ]);

  res.status(200).json({
    success: true,
    stats: { total, pending, confirmed, completed, cancelled, noShow },
  });
});

export const getBookedSlots = asyncHandler(async (req, res, next) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return next(new AppError("doctorId and date are required.", 400));
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const booked = await Appointment.find({
    doctor:          doctorId,
    appointmentDate: { $gte: start, $lte: end },
    status:          { $in: ["Pending", "Confirmed"] },
  }).select("timeSlot");

  res.status(200).json({
    success: true,
    bookedSlots: booked.map((a) => a.timeSlot),
  });
});
