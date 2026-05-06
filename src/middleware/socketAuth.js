import jwt from 'jsonwebtoken';

/**
 * Socket.io middleware for JWT authentication
 * Validates JWT token from handshake query or auth header
 * Attaches decoded user info to socket.user
 */
export const socketAuthMiddleware = (socket, next) => {
  try {
    // Get token from query parameters or auth header
    let token = socket.handshake.auth?.token;

    if (!token) {
      // Try to get from query string as fallback
      token = socket.handshake.query?.token;
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Remove "Bearer " prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to socket
    socket.user = decoded;
    socket.userId = decoded.id;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error(`Authentication error: ${error.message}`));
  }
};

/**
 * Optional Socket.io middleware to attach socket instance globally
 * Useful for controllers to emit events to specific users
 */
export const attachSocketInstance = (io) => {
  return (socket, next) => {
    socket.io = io;
    next();
  };
};
