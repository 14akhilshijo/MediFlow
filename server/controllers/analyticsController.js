import { Appointment }  from "../models/Appointment.js";
import { Doctor }       from "../models/Doctor.js";
import { User }         from "../models/User.js";
import { MedicalReport } from "../models/MedicalReport.js";
import asyncHandler     from "../middlewares/asyncHandler.js";

const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const getOverview = asyncHandler(async (_req, res) => {
  const now        = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalAppointments, thisMonthAppts, lastMonthAppts,
    totalDoctors, activeDoctors,
    totalPatients, thisMonthPatients, lastMonthPatients,
    pendingAppts, completedAppts, cancelledAppts, confirmedAppts,
    totalReports,
  ] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    Appointment.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Doctor.countDocuments(),
    Doctor.countDocuments({ isVerified: true, isAcceptingPatients: true }),
    User.countDocuments({ role: "Patient" }),
    User.countDocuments({ role: "Patient", createdAt: { $gte: thisMonthStart } }),
    User.countDocuments({ role: "Patient", createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Appointment.countDocuments({ status: "Pending" }),
    Appointment.countDocuments({ status: "Completed" }),
    Appointment.countDocuments({ status: "Cancelled" }),
    Appointment.countDocuments({ status: "Confirmed" }),
    MedicalReport.countDocuments({ isDeleted: false }),
  ]);

  const pctChange = (curr, prev) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  res.status(200).json({
    success: true,
    overview: {
      appointments: {
        total:     totalAppointments,
        thisMonth: thisMonthAppts,
        lastMonth: lastMonthAppts,
        change:    pctChange(thisMonthAppts, lastMonthAppts),
        pending:   pendingAppts,
        confirmed: confirmedAppts,
        completed: completedAppts,
        cancelled: cancelledAppts,
      },
      doctors:  { total: totalDoctors, active: activeDoctors },
      patients: {
        total:     totalPatients,
        thisMonth: thisMonthPatients,
        lastMonth: lastMonthPatients,
        change:    pctChange(thisMonthPatients, lastMonthPatients),
      },
      reports: { total: totalReports },
    },
  });
});

export const getMonthlyTrend = asyncHandler(async (_req, res) => {
  const since = monthsAgo(11);

  const raw = await Appointment.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id:       { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total:     { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
        pending:   { $sum: { $cond: [{ $eq: ["$status", "Pending"]   }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] } },
        revenue:   { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$fee", 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const dataMap = new Map(raw.map((r) => [`${r._id.year}-${r._id.month}`, r]));

  const trend = months.map(({ year, month }) => {
    const key  = `${year}-${month}`;
    const item = dataMap.get(key) || {};
    return {
      month:     MONTH_LABELS[month - 1],
      year,
      total:     item.total     || 0,
      completed: item.completed || 0,
      cancelled: item.cancelled || 0,
      pending:   item.pending   || 0,
      confirmed: item.confirmed || 0,
      revenue:   item.revenue   || 0,
    };
  });

  res.status(200).json({ success: true, trend });
});

export const getStatusBreakdown = asyncHandler(async (_req, res) => {
  const raw = await Appointment.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const STATUS_COLORS = {
    Pending:   "#f59e0b",
    Confirmed: "#3b82f6",
    Completed: "#10b981",
    Cancelled: "#ef4444",
    "No-Show": "#8b5cf6",
  };

  const total = raw.reduce((s, r) => s + r.count, 0);

  const breakdown = raw.map((r) => ({
    status: r._id,
    count:  r.count,
    pct:    total > 0 ? Math.round((r.count / total) * 100) : 0,
    color:  STATUS_COLORS[r._id] || "#6b7280",
  }));

  res.status(200).json({ success: true, total, breakdown });
});

export const getDepartmentBreakdown = asyncHandler(async (_req, res) => {
  const raw = await Appointment.aggregate([
    {
      $lookup: {
        from: "departments", localField: "department", foreignField: "_id", as: "dept",
      },
    },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id:       "$dept._id",
        name:      { $first: { $ifNull: ["$dept.name", "Unknown"] } },
        icon:      { $first: "$dept.icon" },
        total:     { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 8 },
  ]);

  res.status(200).json({ success: true, departments: raw });
});

export const getTopDoctors = asyncHandler(async (_req, res) => {
  const raw = await Appointment.aggregate([
    {
      $group: {
        _id:       "$doctor",
        total:     { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
        revenue:   { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$fee", 0] } },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
    { $lookup: { from: "doctors",      localField: "_id",          foreignField: "_id", as: "doctor" } },
    { $unwind: "$doctor" },
    { $lookup: { from: "users",        localField: "doctor.user",  foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $lookup: { from: "departments",  localField: "doctor.department", foreignField: "_id", as: "dept" } },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id:            0,
        doctorId:       "$_id",
        total:          1,
        completed:      1,
        revenue:        1,
        name:           { $concat: ["$user.firstName", " ", "$user.lastName"] },
        specialization: "$doctor.specialization",
        department:     { $ifNull: ["$dept.name", "General"] },
        avatar:         "$user.avatar.url",
        rating:         "$doctor.rating.average",
        isVerified:     "$doctor.isVerified",
      },
    },
  ]);

  res.status(200).json({ success: true, doctors: raw });
});

export const getPatientGrowth = asyncHandler(async (_req, res) => {
  const since = monthsAgo(5);

  const raw = await User.aggregate([
    { $match: { role: "Patient", createdAt: { $gte: since } } },
    {
      $group: {
        _id:   { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const dataMap = new Map(raw.map((r) => [`${r._id.year}-${r._id.month}`, r.count]));

  const growth = months.map(({ year, month }) => ({
    month: MONTH_LABELS[month - 1],
    year,
    count: dataMap.get(`${year}-${month}`) || 0,
  }));

  res.status(200).json({ success: true, growth });
});
