/**
 * Socket.io Event Handlers
 * Manages personalized socket rooms and real-time engagement events
 */

export const initializeSocketEvents = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    const userName = socket.user?.username;

    if (!userId) {
      console.error('Socket connected without valid user ID');
      socket.disconnect();
      return;
    }

    // Join user to their personalized room
    socket.join(userId);
    console.log(`✅ User ${userName} (${userId}) connected. Joined room: ${userId}`);

    // Broadcast user online status to their room
    io.to(userId).emit('user-online', {
      userId,
      userName,
      timestamp: new Date(),
    });

    // Track connected users
    socket.on('disconnect', () => {
      console.log(`❌ User ${userName} (${userId}) disconnected`);
      io.to(userId).emit('user-offline', {
        userId,
        timestamp: new Date(),
      });
    });

    // Handle engagement notifications
    // These events are triggered by controllers and broadcasted to specific user rooms

    /**
     * new-like event
     * Emitted when a user likes a video
     * Data: { likerId, likerUsername, videoId, videoTitle, timestamp }
     */
    socket.on('new-like', (data) => {
      console.log(`📝 Like notification: ${data.likerUsername} liked "${data.videoTitle}"`);
      // Note: This is typically emitted FROM controllers, not received here
      // But we keep it for documentation
    });

    /**
     * new-comment event
     * Emitted when a user comments on a video
     * Data: { commenterId, commenterUsername, videoId, videoTitle, comment, timestamp }
     */
    socket.on('new-comment', (data) => {
      console.log(`💬 Comment notification: ${data.commenterUsername} commented on "${data.videoTitle}"`);
    });

    /**
     * new-follower event
     * Emitted when a user follows another user
     * Data: { followerId, followerUsername, timestamp }
     */
    socket.on('new-follower', (data) => {
      console.log(`👤 New follower: ${data.followerUsername}`);
    });

    /**
     * new-tip event
     * Emitted when a creator receives a tip (Phase 3)
     * Data: { senderId, senderUsername, amount, videoId, videoTitle, timestamp }
     */
    socket.on('new-tip', (data) => {
      console.log(`💰 New tip: ${data.senderUsername} sent $${data.amount}`);
    });

    /**
     * engagement-cleared event
     * Emitted when user visits notifications page to clear badge
     * Data: { userId, timestamp }
     */
    socket.on('engagement-cleared', (data) => {
      console.log(`🔔 Engagement notifications cleared for user ${data.userId}`);
      io.to(userId).emit('badge-cleared');
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });
};

/**
 * Utility function to emit engagement event to specific user
 * Called from controllers
 */
export const emitToUser = (io, userId, eventName, data) => {
  if (!io || !userId) {
    console.error('Invalid io instance or userId for emit');
    return;
  }

  io.to(userId).emit(eventName, {
    ...data,
    timestamp: new Date(),
  });
};

/**
 * Utility function to emit to multiple users
 */
export const emitToUsers = (io, userIds, eventName, data) => {
  if (!Array.isArray(userIds)) {
    console.error('userIds must be an array');
    return;
  }

  userIds.forEach((userId) => {
    emitToUser(io, userId, eventName, data);
  });
};

/**
 * Get connected users in a room
 */
export const getSocketsInRoom = (io, roomId) => {
  return io.sockets.adapter.rooms.get(roomId);
};

/**
 * Check if user is online
 */
export const isUserOnline = (io, userId) => {
  const room = io.sockets.adapter.rooms.get(userId);
  return room && room.size > 0;
};
