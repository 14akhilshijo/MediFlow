export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const color =
      res.statusCode >= 500 ? "\x1b[31m"
      : res.statusCode >= 400 ? "\x1b[33m"
      : res.statusCode >= 300 ? "\x1b[36m"
      : "\x1b[32m";
    const reset = "\x1b[0m";

    console.log(
      `${color}${req.method.padEnd(7)}${reset} ${req.originalUrl.padEnd(40)} ${color}${res.statusCode}${reset}  ${duration}ms`
    );
  });

  next();
};
