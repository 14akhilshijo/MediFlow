/**
 * sendToken
 *
 * Signs a JWT, sets it as an httpOnly cookie, and sends a JSON response.
 *
 * Cookie security flags:
 *   httpOnly  – inaccessible via document.cookie → XSS protection
 *   secure    – HTTPS only in production
 *   sameSite  – "none" in production (cross-origin), "lax" in development
 *
 * The token is also returned in the response body so API clients that
 * cannot use cookies (mobile apps, Postman) can store it in memory.
 *
 * @param {import("mongoose").Document} user       - Mongoose User document
 * @param {number}                      statusCode - HTTP status (201 register, 200 login)
 * @param {string}                      message    - Success message
 * @param {import("express").Response}  res        - Express response object
 */
export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateJWT();

  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  // Strip sensitive fields before sending
  user.password            = undefined;
  user.passwordChangedAt   = undefined;
  user.passwordResetToken  = undefined;
  user.passwordResetExpires = undefined;

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user,
    });
};
