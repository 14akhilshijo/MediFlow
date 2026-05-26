/**
 * asyncHandler
 *
 * Wraps an async Express route handler and automatically forwards any
 * rejected promise to next(err), routing it to the global error handler.
 *
 * Eliminates repetitive try/catch blocks in every controller.
 *
 * @param   {Function} fn  - async (req, res, next) => {}
 * @returns {Function}     - Express middleware
 *
 * @example
 *   router.get("/users", asyncHandler(async (req, res) => {
 *     const users = await User.find();
 *     res.json({ success: true, users });
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
