import { Server } from 'socket.io';

let io = null;
const userSockets = new Map(); // Track which socket belongs to which user

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - Express HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
      credentials: true,
    },
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // User joins their personal room
    socket.on('user:join', (userId) => {
      console.log(`[Socket.IO] User ${userId} joined room user_${userId}`);
      socket.join(`user_${userId}`);
      userSockets.set(userId, socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      // Remove user from tracking
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket() first.');
  }
  return io;
};

/**
 * Emit a like event to video owner's room
 * @param {string} videoOwnerId - MongoDB ID of the video owner
 * @param {object} likeData - Data about the like event
 */
export const emitNewLike = (videoOwnerId, likeData) => {
  const io = getIO();
  const roomName = `user_${videoOwnerId}`;
  
  console.log(`[Socket.IO] Emitting new-like to room: ${roomName}`, {
    liker: likeData.liker,
    videoTitle: likeData.videoTitle,
  });

  io.to(roomName).emit('new-like', {
    event: 'new-like',
    data: {
      likerId: likeData.likerId,
      liker: likeData.liker,
      videoId: likeData.videoId,
      videoTitle: likeData.videoTitle,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Emit an unlike event to video owner's room
 * @param {string} videoOwnerId - MongoDB ID of the video owner
 * @param {object} unlikeData - Data about the unlike event
 */
export const emitUnlike = (videoOwnerId, unlikeData) => {
  const io = getIO();
  const roomName = `user_${videoOwnerId}`;

  console.log(`[Socket.IO] Emitting unlike to room: ${roomName}`, {
    liker: unlikeData.liker,
    videoTitle: unlikeData.videoTitle,
  });

  io.to(roomName).emit('unlike', {
    event: 'unlike',
    data: {
      likerId: unlikeData.likerId,
      liker: unlikeData.liker,
      videoId: unlikeData.videoId,
      videoTitle: unlikeData.videoTitle,
      timestamp: new Date().toISOString(),
    },
  });
};
