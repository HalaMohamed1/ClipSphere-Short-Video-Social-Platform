import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;
const eventListeners = new Map<string, Set<Function>>();

// Event types for engagement notifications
export interface EngagementEvent {
  likerId?: string;
  liker?: string;
  tipperId?: string;
  tipperUsername?: string;
  followerId?: string;
  followerUsername?: string;
  reviewerId?: string;
  reviewerUsername?: string;
  commenterId?: string;
  commenterUsername?: string;
  videoId: string;
  videoTitle: string;
  amount?: number;
  rating?: number;
  comment?: string;
  timestamp: string;
}

const createEventHandler = (eventName: string) => {
  return (eventData: { event?: string; data?: EngagementEvent } | EngagementEvent) => {
    // Handle both nested { event, data } and flat data structures
    const data = (eventData as any).data || eventData;
    console.log(`[Socket.IO] Received ${eventName} event:`, data);
    
    // Call all registered listeners for this event
    const listeners = eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          (callback as Function)(data);
        } catch (error) {
          console.error(`[Socket.IO] Error in ${eventName} listener:`, error);
        }
      });
    }
  };
};

const getAuthToken = (): string | null => {
  // Login stores the token in localStorage (httpOnly cookie is not readable by JS)
  if (typeof window !== 'undefined') {
    const lsToken = window.localStorage.getItem('jwtToken');
    if (lsToken) return lsToken;
  }
  // Fallback: non-httpOnly cookie (dev / older sessions)
  if (typeof document !== 'undefined') {
    for (const cookie of document.cookie.split(';')) {
      const [name, value] = cookie.split('=');
      if (name.trim() === 'token') return decodeURIComponent(value);
    }
  }
  return null;
};

export const initializeSocket = (): Socket => {
  const token = getAuthToken();
  // Reuse only if already connected WITH auth; otherwise reconnect so userId gets set
  if (socket && socket.connected) {
    if (token && !(socket as any)._authed) {
      socket.disconnect();
      socket = null;
    } else {
      return socket;
    }
  }

  // Socket.IO needs the origin only — strip /api/v1 path so it doesn't become a namespace
  const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050')
    .replace(/\/api(\/v\d+.*)?$/, '');

  console.log(`[Socket.IO] Connecting to ${socketUrl} with auth token: ${token ? 'present' : 'missing'}`);

  socket = io(socketUrl, {
    path: '/socket.io/',
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    auth: token
      ? {
          token: token,
        }
      : undefined,
  });

  socket.on('connect', () => {
    if (token) (socket as any)._authed = true;
    console.log('[Socket.IO] Connected to server:', socket?.id);
  });

  socket.on('connect_success', (data) => {
    console.log('[Socket.IO] Connection success:', data);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.IO] Connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected from server:', reason);
  });

  socket.on('error', (error) => {
    console.error('[Socket.IO] Socket error:', error);
  });

  // Register event handlers
  const eventNames = ['new-like', 'unlike', 'new-follower', 'new-review', 'new-comment', 'new-tip'];
  eventNames.forEach((eventName) => {
    socket?.on(eventName, createEventHandler(eventName));
  });

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const joinUserRoom = (userId: string): void => {
  if (!userId) {
    console.warn('[Socket.IO] userId is required to join user room');
    return;
  }

  const sock = getSocket();
  const joinRoom = () => {
    sock.emit('user:join', userId);
    console.log(`[Socket.IO] Joined room: user_${userId}`);
  };

  if (sock.connected) {
    joinRoom();
  } else {
    sock.once('connect', joinRoom);
  }
};

export const leaveUserRoom = (userId: string): void => {
  if (!socket || !userId) return;

  socket.emit('user:leave', userId);
  console.log(`[Socket.IO] Left room: user_${userId}`);
};

const createEventSubscription = (eventName: string) => {
  return (
    callback: (data: EngagementEvent) => void
  ): (() => void) => {
    // Initialize listener set for this event if not already done
    if (!eventListeners.has(eventName)) {
      eventListeners.set(eventName, new Set());
    }

    // Add this callback to the set of listeners
    const listeners = eventListeners.get(eventName)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        eventListeners.delete(eventName);
      }
    };
  };
};

export const onNewLike = createEventSubscription('new-like');

export const onUnlike = createEventSubscription('unlike');

export const onNewFollower = createEventSubscription('new-follower');

export const onNewReview = createEventSubscription('new-review');

export const onNewComment = createEventSubscription('new-comment');

export const onNewTip = createEventSubscription('new-tip');

// Subscription management helpers
export const clearAllListeners = (eventName?: string): void => {
  if (eventName) {
    eventListeners.delete(eventName);
    console.log(`[Socket.IO] Cleared listeners for event: ${eventName}`);
  } else {
    eventListeners.clear();
    console.log('[Socket.IO] Cleared all listeners');
  }
};

export const getActiveListenerCount = (eventName?: string): number => {
  if (eventName) {
    return eventListeners.get(eventName)?.size || 0;
  }
  let total = 0;
  eventListeners.forEach((listeners) => {
    total += listeners.size;
  });
  return total;
};

export const disconnectSocket = (): void => {
  if (socket) {
    // Clear all listeners before disconnecting
    clearAllListeners();
    socket.disconnect();
    socket = null;
    console.log('[Socket.IO] Socket disconnected and cleaned up');
  }
};
