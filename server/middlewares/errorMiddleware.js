export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";
  let status     = err.status     || "error";

  if (err.name === "CastError") {
    message    = `Invalid ${err.path}: "${err.value}". Please provide a valid ID.`;
    statusCode = 400;
    status     = "fail";
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message    = `"${value}" is already registered for field: ${field}.`;
    statusCode = 400;
    status     = "fail";
  }

  if (err.name === "ValidationError") {
    message    = Object.values(err.errors).map((e) => e.message).join(". ");
    statusCode = 400;
    status     = "fail";
  }

  if (err.name === "JsonWebTokenError") {
    message    = "Invalid token. Please log in again.";
    statusCode = 401;
    status     = "fail";
  }

  if (err.name === "TokenExpiredError") {
    message    = "Your session has expired. Please log in again.";
    statusCode = 401;
    status     = "fail";
  }

  res.status(statusCode).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
