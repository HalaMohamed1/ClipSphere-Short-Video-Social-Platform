import io from 'socket.io-client';

let socketInstance = null;

/**
 * Initialize Socket.io connection with JWT authentication
 * @param {string} token - JWT authentication token
 * @returns {Object} Socket instance
 */
export const initializeSocket = (token) => {
  if (socketInstance) {
    console.log('ℹ️  Reusing existing socket instance:', socketInstance.id);
    return socketInstance;
  }

  const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  console.log('🔌 Initializing socket connection to:', serverUrl);

  socketInstance = io(serverUrl, {
    auth: {
      token: `Bearer ${token}`,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  // Connection event handlers
  socketInstance.on('connect', () => {
    console.log('✅ Socket connected:', socketInstance.id);
  });

  socketInstance.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socketInstance.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  socketInstance.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  console.log('🔗 Socket instance created, waiting for connection...');
  return socketInstance;
};

/**
 * Get existing socket instance or initialize if needed
 */
export const getSocket = () => {
  return socketInstance;
};

/**
 * Close socket connection
 */
export const closeSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Re-initialize socket with new token
 * Useful when token refreshes
 */
export const reconnectSocket = (token) => {
  closeSocket();
  return initializeSocket(token);
};
