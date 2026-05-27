import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import asyncHandler from "./asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
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

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token. Please log in again.", 401));
  }

  const user = await User.findById(decoded.id).select("+passwordChangedAt");
  if (!user) {
    return next(
      new AppError("The account belonging to this token no longer exists.", 401)
    );
  }

  if (!user.isActive) {
    return next(
      new AppError("Your account has been deactivated. Please contact support.", 403)
    );
  }

  if (user.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError("Your password was recently changed. Please log in again.", 401)
    );
  }

  req.user = user;
  next();
});

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
