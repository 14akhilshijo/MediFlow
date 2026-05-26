/**
 * AppError – Custom Operational Error
 *
 * Distinguishes expected, user-facing errors (validation, auth, not-found)
 * from unexpected programming bugs.
 *
 * The global error handler (errorMiddleware.js) checks `isOperational`:
 *   - true  → safe to expose message to client
 *   - false → generic "Internal Server Error" shown instead
 *
 * @example
 *   throw new AppError("User not found.", 404);
 *   return next(new AppError("Invalid credentials.", 401));
 */
export class AppError extends Error {
  /**
   * @param {string} message    - Human-readable error message sent to client
   * @param {number} statusCode - HTTP status code (4xx for client, 5xx for server)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode    = statusCode;
    this.status        = String(statusCode).startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Capture clean stack trace (excludes this constructor frame)
    Error.captureStackTrace(this, this.constructor);
  }
}
