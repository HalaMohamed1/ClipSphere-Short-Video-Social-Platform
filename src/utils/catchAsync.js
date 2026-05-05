// Wrapper to catch async errors in route handlers
export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
