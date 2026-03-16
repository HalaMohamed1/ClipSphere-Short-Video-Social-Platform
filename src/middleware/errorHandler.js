import { AppError } from '../utils/appError.js';

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    err = new AppError(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new AppError(`${field} already exists`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    err = new AppError('Token has expired', 401);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const errors = err.errors.map((error) => ({
      path: error.path.join('.'),
      message: error.message,
    }));
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors,
    });
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found middleware
export const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};
