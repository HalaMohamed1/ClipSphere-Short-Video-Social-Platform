import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { User } from '../models/User.js';

// Protect middleware: Verify JWT and set req.user
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.active) {
      return next(new AppError('The user belonging to this token no longer exists or is inactive.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    next(error);
  }
};

// restrictTo middleware: Restrict access by role
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

// Ownership check: Ensure user owns the resource
export const checkOwnership = (resourceOwnerId) => {
  return (req, res, next) => {
    if (req.user.id !== resourceOwnerId.toString() && req.user.role !== 'admin') {
      return next(
        new AppError('You are not authorized to perform this action on this resource.', 403)
      );
    }
    next();
  };
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};
