import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;
const userSockets = new Map(); // Track which socket belongs to which user

const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    console.warn(`[Socket.IO] Connection attempt without token: ${socket.id}`);
    // Allow connection even without token for now, but mark as unauthenticated
    socket.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    socket.userId = decoded.id;
    console.log(`[Socket.IO] Socket authenticated for user: ${socket.userId}`);
    next();
  } catch (error) {
    console.error('[Socket.IO] Token verification failed:', error.message);
    socket.userId = null;
    next(); // Allow connection but mark as unauthenticated
  }
};

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
      credentials: true,
    },
  });

  // Add authentication middleware
  io.use(verifySocketToken);

  // Connection event
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}, userId: ${socket.userId}`);

    // User joins their personal room
    socket.on('user:join', (userId) => {
      if (socket.userId && socket.userId === userId) {
        console.log(`[Socket.IO] User ${userId} joined room user_${userId}`);
        socket.join(`user_${userId}`);
        userSockets.set(userId, socket.id);
        socket.emit('user:joined', { success: true, room: `user_${userId}` });
      } else {
        console.warn(`[Socket.IO] Unauthorized room join attempt: ${socket.id} tried to join ${userId}`);
        socket.emit('error', { message: 'Unauthorized' });
      }
    });

    // User leaves their personal room
    socket.on('user:leave', (userId) => {
      if (socket.userId && socket.userId === userId) {
        console.log(`[Socket.IO] User ${userId} left room user_${userId}`);
        socket.leave(`user_${userId}`);
        userSockets.delete(userId);
      }
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

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket() first.');
  }
  return io;
};

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

export const emitNewFollower = (followedUserId, followerData) => {
  const io = getIO();
  const roomName = `user_${followedUserId}`;

  console.log(`[Socket.IO] Emitting new-follower to room: ${roomName}`, {
    follower: followerData.followerUsername,
  });

  io.to(roomName).emit('new-follower', {
    event: 'new-follower',
    data: {
      followerId: followerData.followerId,
      followerUsername: followerData.followerUsername,
      timestamp: new Date().toISOString(),
    },
  });
};

export const emitNewReview = (videoOwnerId, reviewData) => {
  const io = getIO();
  const roomName = `user_${videoOwnerId}`;

  console.log(`[Socket.IO] Emitting new-review to room: ${roomName}`, {
    reviewer: reviewData.reviewerUsername,
    videoTitle: reviewData.videoTitle,
  });

  io.to(roomName).emit('new-review', {
    event: 'new-review',
    data: {
      reviewerId: reviewData.reviewerId,
      reviewerUsername: reviewData.reviewerUsername,
      rating: reviewData.rating,
      comment: reviewData.comment,
      videoId: reviewData.videoId,
      videoTitle: reviewData.videoTitle,
      timestamp: new Date().toISOString(),
    },
  });
};

export const emitNewComment = (videoOwnerId, commentData) => {
  const io = getIO();
  const roomName = `user_${videoOwnerId}`;

  console.log(`[Socket.IO] Emitting new-comment to room: ${roomName}`, {
    commenter: commentData.commenterUsername,
    videoTitle: commentData.videoTitle,
  });

  io.to(roomName).emit('new-comment', {
    event: 'new-comment',
    data: {
      commenterId: commentData.commenterId,
      commenterUsername: commentData.commenterUsername,
      comment: commentData.comment,
      videoId: commentData.videoId,
      videoTitle: commentData.videoTitle,
      timestamp: new Date().toISOString(),
    },
  });
};

export const emitNewTip = (creatorId, tipData) => {
  const io = getIO();
  const roomName = `user_${creatorId}`;

  console.log(`[Socket.IO] Emitting new-tip to room: ${roomName}`, {
    tipper: tipData.tipperUsername,
    amount: tipData.amount,
  });

  io.to(roomName).emit('new-tip', {
    event: 'new-tip',
    data: {
      tipperId: tipData.tipperId,
      tipperUsername: tipData.tipperUsername,
      amount: tipData.amount,
      videoId: tipData.videoId,
      videoTitle: tipData.videoTitle,
      timestamp: new Date().toISOString(),
    },
  });
};
