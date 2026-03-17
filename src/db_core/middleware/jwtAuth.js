import jwt from 'jsonwebtoken';
import { UserCore as User } from '../models/User.js';

/**
 * @openapi
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Invalid token.
 */

// JWT Bearer Protection Middleware
export const authenticateToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. Please provide a Bearer token in the Authorization header.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user to request 
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'No user found for this token.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is suspended.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or malformed token.',
    });
  }
};

export const generateCoreToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};
