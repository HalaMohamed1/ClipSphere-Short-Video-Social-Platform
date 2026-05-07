import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = (): Socket => {
  if (socket) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected to server:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Disconnected from server');
  });

  socket.on('error', (error) => {
    console.error('[Socket.IO] Error:', error);
  });

  return socket;
};

/**
 * Get Socket.IO instance (ensures initialization)
 */
export const getSocket = (): Socket => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Join user's personal room (called on authentication)
 */
export const joinUserRoom = (userId: string): void => {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('user:join', userId);
    console.log(`[Socket.IO] Joined room: user_${userId}`);
  } else {
    // Wait for connection before joining
    sock.once('connect', () => {
      sock.emit('user:join', userId);
      console.log(`[Socket.IO] Joined room: user_${userId}`);
    });
  }
};

/**
 * Listen for new like events
 */
export const onNewLike = (
  callback: (data: {
    likerId: string;
    liker: string;
    videoId: string;
    videoTitle: string;
    timestamp: string;
  }) => void
): (() => void) => {
  const sock = getSocket();
  sock.on('new-like', (event) => {
    console.log('[Socket.IO] Received new-like event:', event.data);
    callback(event.data);
  });

  // Return unsubscribe function
  return () => {
    sock.off('new-like');
  };
};

/**
 * Listen for unlike events
 */
export const onUnlike = (
  callback: (data: {
    likerId: string;
    liker: string;
    videoId: string;
    videoTitle: string;
    timestamp: string;
  }) => void
): (() => void) => {
  const sock = getSocket();
  sock.on('unlike', (event) => {
    console.log('[Socket.IO] Received unlike event:', event.data);
    callback(event.data);
  });

  // Return unsubscribe function
  return () => {
    sock.off('unlike');
  };
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket.IO] Socket disconnected');
  }
};
