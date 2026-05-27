import { Doctor }              from "../models/Doctor.js";
import { User }                from "../models/User.js";
import { AppError }            from "../utils/AppError.js";
import { APIFeatures }         from "../utils/apiFeatures.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import asyncHandler            from "../middlewares/asyncHandler.js";

const safeParseJSON = (str, fallback = []) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

const POPULATE_USER = { path: "user", select: "-password -passwordResetToken -passwordResetExpires -passwordChangedAt" };
const POPULATE_DEPT = { path: "department", select: "name icon description" };

export const addDoctor = asyncHandler(async (req, res, next) => {
  const {
    firstName, lastName, email, phone, password,
    gender, dob,
    department, specialization, qualifications,
    experience, bio, consultationFee, followUpFee,
    availableSlots,
  } = req.body;

  const existing = await User.findOne({ email: email?.toLowerCase().trim() });
  if (existing) return next(new AppError("A user with this email already exists.", 400));

  const userPayload = {
    firstName, lastName, email, phone, password,
    gender, dob, role: "Doctor",
  };

  if (req.files?.avatar) {
    const { public_id, secure_url } = await uploadToCloudinary(
      req.files.avatar.tempFilePath,
      "mediflow/doctors"
    );
    userPayload.avatar = { public_id, url: secure_url };
  }

  const user = await User.create(userPayload);

  const doctorPayload = {
    user:            user._id,
    department,
    specialization,
    experience:      Number(experience),
    consultationFee: Number(consultationFee),
    followUpFee:     followUpFee ? Number(followUpFee) : 0,
    bio:             bio || "",
    qualifications:  qualifications ? safeParseJSON(qualifications) : [],
    availableSlots:  availableSlots ? safeParseJSON(availableSlots) : [],
  };

  const doctor = await Doctor.create(doctorPayload);
  const populated = await Doctor.findById(doctor._id)
    .populate(POPULATE_USER)
    .populate(POPULATE_DEPT);

  res.status(201).json({
    success: true,
    message: "Doctor added successfully.",
    doctor:  populated,
  });
});

export const getAllDoctors = asyncHandler(async (req, res) => {
  const baseFilter = req.user?.role === "Admin" ? {} : { isVerified: true };

  const features = new APIFeatures(
    Doctor.find(baseFilter)
      .populate(POPULATE_USER)
      .populate(POPULATE_DEPT),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [doctors, total] = await Promise.all([
    features.query,
    Doctor.countDocuments(baseFilter),
  ]);

  res.status(200).json({
    success: true,
    count:   doctors.length,
    total,
    doctors,
  });
});

export const getDoctorById = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate(POPULATE_USER)
    .populate(POPULATE_DEPT);

  if (!doctor) return next(new AppError("Doctor not found.", 404));

  res.status(200).json({ success: true, doctor });
});

export const updateDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id).populate(POPULATE_USER);
  if (!doctor) return next(new AppError("Doctor not found.", 404));

  if (req.user.role === "Doctor" && doctor.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only update your own profile.", 403));
  }

  const professionalFields = [
    "department", "specialization", "experience",
    "bio", "consultationFee", "followUpFee",
    "isAcceptingPatients",
  ];
  const doctorUpdates = {};
  professionalFields.forEach((f) => {
    if (req.body[f] !== undefined) doctorUpdates[f] = req.body[f];
  });

  if (req.body.qualifications !== undefined) {
    doctorUpdates.qualifications = typeof req.body.qualifications === "string"
      ? safeParseJSON(req.body.qualifications)
      : req.body.qualifications;
  }

  const personalFields = ["firstName", "lastName", "phone", "gender", "dob"];
  const userUpdates = {};
  personalFields.forEach((f) => {
    if (req.body[f] !== undefined) userUpdates[f] = req.body[f];
  });

  if (req.files?.avatar) {
    if (doctor.user.avatar?.public_id) {
      await deleteFromCloudinary(doctor.user.avatar.public_id);
    }
    const { public_id, secure_url } = await uploadToCloudinary(
      req.files.avatar.tempFilePath,
      "mediflow/doctors"
    );
    userUpdates.avatar = { public_id, url: secure_url };
  }

  const [updatedDoctor] = await Promise.all([
    Doctor.findByIdAndUpdate(req.params.id, doctorUpdates, {
      new: true, runValidators: true,
    })
      .populate(POPULATE_USER)
      .populate(POPULATE_DEPT),
    Object.keys(userUpdates).length
      ? User.findByIdAndUpdate(doctor.user._id, userUpdates, { new: true, runValidators: true })
      : Promise.resolve(),
  ]);

  res.status(200).json({
    success: true,
    message: "Doctor updated successfully.",
    doctor:  updatedDoctor,
  });
});

export const updateAvailability = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return next(new AppError("Doctor not found.", 404));

  if (req.user.role === "Doctor" && doctor.user.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only update your own schedule.", 403));
  }

  const slots = typeof req.body.availableSlots === "string"
    ? safeParseJSON(req.body.availableSlots)
    : req.body.availableSlots;

  if (!Array.isArray(slots)) {
    return next(new AppError("availableSlots must be an array.", 400));
  }

  doctor.availableSlots = slots;
  await doctor.save({ validateBeforeSave: true });

  const populated = await Doctor.findById(doctor._id)
    .populate(POPULATE_USER)
    .populate(POPULATE_DEPT);

  res.status(200).json({
    success: true,
    message: "Availability schedule updated.",
    doctor:  populated,
  });
});

export const verifyDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  )
    .populate(POPULATE_USER)
    .populate(POPULATE_DEPT);

  if (!doctor) return next(new AppError("Doctor not found.", 404));

  res.status(200).json({
    success: true,
    message: "Doctor verified successfully.",
    doctor,
  });
});

export const deleteDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id).populate("user", "avatar");
  if (!doctor) return next(new AppError("Doctor not found.", 404));

  if (doctor.user?.avatar?.public_id) {
    await deleteFromCloudinary(doctor.user.avatar.public_id).catch(() => {});
  }

  await Promise.all([
    User.findByIdAndDelete(doctor.user._id),
    doctor.deleteOne(),
  ]);

  res.status(200).json({
    success: true,
    message: "Doctor and associated account deleted.",
  });
});

export const getMyProfile = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id })
    .populate(POPULATE_USER)
    .populate(POPULATE_DEPT);

  if (!doctor) return next(new AppError("Doctor profile not found.", 404));

  res.status(200).json({ success: true, doctor });
});

export const getDoctorStats = asyncHandler(async (req, res) => {
  const [totals, byDepartment] = await Promise.all([
    Doctor.aggregate([
      {
        $group: {
          _id:        null,
          total:      { $sum: 1 },
          verified:   { $sum: { $cond: ["$isVerified", 1, 0] } },
          unverified: { $sum: { $cond: ["$isVerified", 0, 1] } },
          avgFee:     { $avg: "$consultationFee" },
          avgExp:     { $avg: "$experience" },
        },
      },
    ]),
    Doctor.aggregate([
      {
        $lookup: {
          from:         "departments",
          localField:   "department",
          foreignField: "_id",
          as:           "dept",
        },
      },
      { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id:   "$dept._id",
          name:  { $first: "$dept.name" },
          icon:  { $first: "$dept.icon" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      ...(totals[0] ?? { total: 0, verified: 0, unverified: 0, avgFee: 0, avgExp: 0 }),
      byDepartment,
    },
  });
});
