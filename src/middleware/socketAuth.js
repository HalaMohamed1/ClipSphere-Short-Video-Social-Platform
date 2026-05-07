import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;
    if (!token) {
      token = socket.handshake.query?.token;
    }
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    socket.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error(`Authentication error: ${error.message}`));
  }
};

export const attachSocketInstance = (io) => {
  return (socket, next) => {
    socket.io = io;
    next();
  };
};
