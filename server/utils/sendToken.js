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
