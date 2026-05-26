/**
 * Global Error Handling Middleware
 *
 * Must be the LAST middleware registered in app.js.
 * Catches every error forwarded via next(err) and returns a consistent
 * JSON envelope. Handles Mongoose and JWT error types automatically.
 *
 * Response shape:
 *   { success: false, status: "fail"|"error", message: string, stack?: string }
 */
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";
  let status     = err.status     || "error";

  // ── Mongoose: bad ObjectId ─────────────────────────────────────────────────
  if (err.name === "CastError") {
    message    = `Invalid ${err.path}: "${err.value}". Please provide a valid ID.`;
    statusCode = 400;
    status     = "fail";
  }

  // ── Mongoose: duplicate key ────────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message    = `"${value}" is already registered for field: ${field}.`;
    statusCode = 400;
    status     = "fail";
  }

  // ── Mongoose: validation error ─────────────────────────────────────────────
  if (err.name === "ValidationError") {
    message    = Object.values(err.errors).map((e) => e.message).join(". ");
    statusCode = 400;
    status     = "fail";
  }

  // ── JWT: invalid signature ─────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    message    = "Invalid token. Please log in again.";
    statusCode = 401;
    status     = "fail";
  }

  // ── JWT: expired ───────────────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    message    = "Your session has expired. Please log in again.";
    statusCode = 401;
    status     = "fail";
  }

  // ── Response ───────────────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    status,
    message,
    // Stack trace only in development – never expose in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
