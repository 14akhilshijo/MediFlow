/**
 * Authentication & Authorization Middleware
 *
 * protect     – Verifies JWT, attaches req.user
 * restrictTo  – Role-based access control (RBAC)
 */

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import asyncHandler from "./asyncHandler.js";

// ─── protect ──────────────────────────────────────────────────────────────────
/**
 * Verifies the JWT from:
 *   1. httpOnly cookie named "token"  (preferred – XSS safe)
 *   2. Authorization: Bearer <token>  (fallback for mobile / API clients)
 *
 * On success, attaches the full Mongoose user document to req.user.
 * Rejects if:
 *   - No token present
 *   - Token signature invalid or expired
 *   - User no longer exists in DB
 *   - User account is deactivated
 *   - Password was changed after the token was issued
 */
export const protect = asyncHandler(async (req, _res, next) => {
  // ── 1. Extract token ────────────────────────────────────────────────────────
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401)
    );
  }

  // ── 2. Verify signature & expiry ────────────────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token. Please log in again.", 401));
  }

  // ── 3. Confirm user still exists ────────────────────────────────────────────
  const user = await User.findById(decoded.id).select("+passwordChangedAt");
  if (!user) {
    return next(
      new AppError("The account belonging to this token no longer exists.", 401)
    );
  }

  // ── 4. Confirm account is active ────────────────────────────────────────────
  if (!user.isActive) {
    return next(
      new AppError("Your account has been deactivated. Please contact support.", 403)
    );
  }

  // ── 5. Check if password changed after token was issued ─────────────────────
  if (user.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError("Your password was recently changed. Please log in again.", 401)
    );
  }

  // ── 6. Attach user to request ───────────────────────────────────────────────
  req.user = user;
  next();
});

// ─── restrictTo ───────────────────────────────────────────────────────────────
/**
 * Role-based access control.
 * Must be chained AFTER protect (requires req.user to be set).
 *
 * @param {...string} roles - Allowed roles e.g. "Admin", "Doctor"
 *
 * @example
 *   router.delete("/:id", protect, restrictTo("Admin"), deleteUser);
 *   router.get("/stats",  protect, restrictTo("Admin", "Doctor"), getStats);
 */
export const restrictTo =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}.`,
          403
        )
      );
    }
    next();
  };
