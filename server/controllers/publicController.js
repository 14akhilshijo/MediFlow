import { Appointment } from "../models/Appointment.js";
import { Doctor }      from "../models/Doctor.js";
import { User }        from "../models/User.js";
import asyncHandler    from "../middlewares/asyncHandler.js";

/**
 * GET /api/v1/public/stats
 * Returns live platform statistics for the public home page.
 * No authentication required.
 */
export const getPublicStats = asyncHandler(async (_req, res) => {
  const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
    User.countDocuments({ role: "Patient" }),
    Doctor.countDocuments({ isVerified: true }),
    Appointment.countDocuments(),
  ]);

  // Years of service derived from the founding year env var (fallback: 2010)
  const foundingYear = parseInt(process.env.FOUNDING_YEAR || "2010", 10);
  const yearsOfService = new Date().getFullYear() - foundingYear;

  res.status(200).json({
    success: true,
    stats: {
      patientsServed:   totalPatients,
      expertDoctors:    totalDoctors,
      appointments:     totalAppointments,
      yearsOfService,
    },
  });
});

/**
 * GET /api/v1/public/settings
 * Returns public contact/site settings driven by environment variables.
 * No authentication required.
 */
export const getSettings = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    settings: {
      phone:   process.env.CONTACT_PHONE   || "",
      email:   process.env.CONTACT_EMAIL   || "",
      address: process.env.CONTACT_ADDRESS || "",
    },
  });
});
