/**
 * Validation Middleware
 *
 * validate          – Checks express-validator results, throws 400 on failure
 * validationRules   – Pre-built rule sets for auth endpoints
 * doctorValidation  – Rule sets for doctor CRUD endpoints
 */

import { body, validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

// ─── Result Checker ───────────────────────────────────────────────────────────
/**
 * Run after a validation chain. Collects all errors and throws a single
 * 400 AppError with all messages joined.
 */
export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((e) => e.msg)
      .join(". ");
    return next(new AppError(messages, 400));
  }
  next();
};

// ─── Reusable Field Rules ─────────────────────────────────────────────────────
const nameRule = (field) =>
  body(field)
    .trim()
    .notEmpty().withMessage(`${field} is required`)
    .isLength({ min: 2, max: 50 }).withMessage(`${field} must be 2–50 characters`);

const emailRule = () =>
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail();

const passwordRule = (field = "password") =>
  body(field)
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number");

const phoneRule = () =>
  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone().withMessage("Please provide a valid phone number");

const genderRule = () =>
  body("gender")
    .notEmpty().withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"]).withMessage("Gender must be Male, Female, or Other");

const dobRule = () =>
  body("dob")
    .notEmpty().withMessage("Date of birth is required")
    .isISO8601().withMessage("Date of birth must be a valid date (YYYY-MM-DD)")
    .custom((val) => {
      const birth = new Date(val);
      const today = new Date();
      if (birth >= today) throw new Error("Date of birth must be in the past");
      const age = today.getFullYear() - birth.getFullYear();
      if (age > 120) throw new Error("Please provide a valid date of birth");
      return true;
    });

const roleRule = () =>
  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["Patient", "Doctor", "Admin"]).withMessage("Role must be Patient, Doctor, or Admin");

// ─── Auth Validation Rule Sets ────────────────────────────────────────────────
export const validationRules = {
  registerPatient: [
    nameRule("firstName"),
    nameRule("lastName"),
    emailRule(),
    phoneRule(),
    passwordRule(),
    genderRule(),
    dobRule(),
  ],

  registerAdmin: [
    nameRule("firstName"),
    nameRule("lastName"),
    emailRule(),
    phoneRule(),
    passwordRule(),
    genderRule(),
    dobRule(),
    body("adminSecretKey").notEmpty().withMessage("Admin secret key is required"),
  ],

  registerDoctor: [
    nameRule("firstName"),
    nameRule("lastName"),
    emailRule(),
    phoneRule(),
    passwordRule(),
    genderRule(),
    dobRule(),
    body("department").notEmpty().withMessage("Department is required"),
    body("specialization").notEmpty().withMessage("Specialization is required"),
    body("experience")
      .notEmpty().withMessage("Experience is required")
      .isNumeric().withMessage("Experience must be a number")
      .custom((v) => {
        if (Number(v) < 0) throw new Error("Experience cannot be negative");
        return true;
      }),
    body("consultationFee")
      .notEmpty().withMessage("Consultation fee is required")
      .isNumeric().withMessage("Consultation fee must be a number"),
  ],

  login: [
    emailRule(),
    body("password").notEmpty().withMessage("Password is required"),
    roleRule(),
  ],

  updatePassword: [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    passwordRule("newPassword"),
    body("confirmPassword")
      .notEmpty().withMessage("Please confirm your new password")
      .custom((val, { req }) => {
        if (val !== req.body.newPassword) throw new Error("Passwords do not match");
        return true;
      }),
  ],

  forgotPassword: [emailRule()],

  resetPassword: [
    passwordRule("password"),
    body("confirmPassword")
      .notEmpty().withMessage("Please confirm your password")
      .custom((val, { req }) => {
        if (val !== req.body.password) throw new Error("Passwords do not match");
        return true;
      }),
  ],
};

// ─── Doctor Validation Rule Sets ──────────────────────────────────────────────

/** Shared professional field rules */
const doctorProfessionalRules = [
  body("department")
    .optional()
    .isMongoId().withMessage("Department must be a valid ID"),

  body("specialization")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Specialization must be 2–100 characters"),

  body("experience")
    .optional()
    .isNumeric().withMessage("Experience must be a number")
    .custom((v) => {
      const n = Number(v);
      if (n < 0)  throw new Error("Experience cannot be negative");
      if (n > 60) throw new Error("Experience cannot exceed 60 years");
      return true;
    }),

  body("consultationFee")
    .optional()
    .isNumeric().withMessage("Consultation fee must be a number")
    .custom((v) => {
      if (Number(v) < 0) throw new Error("Consultation fee cannot be negative");
      return true;
    }),

  body("followUpFee")
    .optional()
    .isNumeric().withMessage("Follow-up fee must be a number")
    .custom((v) => {
      if (Number(v) < 0) throw new Error("Follow-up fee cannot be negative");
      return true;
    }),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 600 }).withMessage("Bio cannot exceed 600 characters"),
];

export const doctorValidation = {
  /** POST /doctors – Add new doctor */
  add: [
    nameRule("firstName"),
    nameRule("lastName"),
    emailRule(),
    phoneRule(),
    passwordRule(),
    genderRule(),
    dobRule(),
    body("department")
      .notEmpty().withMessage("Department is required")
      .isMongoId().withMessage("Department must be a valid ID"),
    body("specialization")
      .notEmpty().withMessage("Specialization is required")
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage("Specialization must be 2–100 characters"),
    body("experience")
      .notEmpty().withMessage("Experience is required")
      .isNumeric().withMessage("Experience must be a number")
      .custom((v) => {
        const n = Number(v);
        if (n < 0)  throw new Error("Experience cannot be negative");
        if (n > 60) throw new Error("Experience cannot exceed 60 years");
        return true;
      }),
    body("consultationFee")
      .notEmpty().withMessage("Consultation fee is required")
      .isNumeric().withMessage("Consultation fee must be a number")
      .custom((v) => {
        if (Number(v) < 0) throw new Error("Consultation fee cannot be negative");
        return true;
      }),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 600 }).withMessage("Bio cannot exceed 600 characters"),
  ],

  /** PATCH /doctors/:id – Update doctor */
  update: [
    ...doctorProfessionalRules,
    body("firstName")
      .optional().trim()
      .isLength({ min: 2, max: 50 }).withMessage("First name must be 2–50 characters"),
    body("lastName")
      .optional().trim()
      .isLength({ min: 2, max: 50 }).withMessage("Last name must be 2–50 characters"),
    body("phone")
      .optional().trim()
      .isMobilePhone().withMessage("Please provide a valid phone number"),
    body("gender")
      .optional()
      .isIn(["Male", "Female", "Other"]).withMessage("Gender must be Male, Female, or Other"),
    body("dob")
      .optional()
      .isISO8601().withMessage("Date of birth must be a valid date"),
  ],

  /** PATCH /doctors/:id/availability – Update schedule */
  availability: [
    body("availableSlots")
      .notEmpty().withMessage("availableSlots is required"),
  ],
};
