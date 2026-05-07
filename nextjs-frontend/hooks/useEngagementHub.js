'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSocket, initializeSocket } from '@/lib/socketService';
import { getJWTToken } from '@/lib/tokenUtils';

/**
 * Hook to manage engagement notifications (likes, comments, follows, tips)
 * Tracks unread notifications and provides methods to manage them
 */
export const useEngagementHub = (shouldConnect = true) => {
  const [engagementNotifications, setEngagementNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Add a new notification
   */
  const addNotification = useCallback((notification) => {
    const notifWithId = {
      id: `${notification.type}-${Date.now()}`,
      read: false,
      ...notification,
    };
    console.log('📌 Adding notification to state:', notifWithId);
    setEngagementNotifications((prev) => {
      const updated = [notifWithId, ...prev];
      console.log('📊 Total notifications in state:', updated.length);
      return updated;
    });
    setHasUnread(true);
    setUnreadCount((prev) => prev + 1);
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setEngagementNotifications([]);
    setHasUnread(false);
    setUnreadCount(0);

    // Emit event to server
    const socket = getSocket();
    if (socket) {
      socket.emit('engagement-cleared', {
        timestamp: new Date(),
      });
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!shouldConnect) {
      console.log('⏭️  Skipping socket connection (shouldConnect=false)');
      setIsLoading(false);
      return;
    }

    try {
      const token = getJWTToken();
      if (!token) {
        console.warn('⚠️  No JWT token found, cannot initialize socket');
        setIsLoading(false);
        return;
      }

      console.log('🚀 useEngagementHub: Initializing socket...');
      const socket = initializeSocket(token);

      // Listen for new engagement events
      socket.on('new-like', (data) => {
        console.log('📝 NEW LIKE RECEIVED:', data);
        addNotification({
          type: 'like',
          ...data,
        });
      });

      socket.on('new-comment', (data) => {
        console.log('💬 NEW COMMENT RECEIVED:', data);
        addNotification({
          type: 'comment',
          ...data,
        });
      });

      socket.on('new-follower', (data) => {
        console.log('👤 NEW FOLLOWER RECEIVED:', data);
        addNotification({
          type: 'follow',
          ...data,
        });
      });

      socket.on('new-tip', (data) => {
        console.log('💰 NEW TIP RECEIVED:', data);
        addNotification({
          type: 'tip',
          ...data,
        });
      });

      socket.on('badge-cleared', () => {
        console.log('🔔 Badge cleared event received');
        clearNotifications();
      });

      console.log('✨ Socket event listeners attached');
      setIsLoading(false);
      setError(null);

      return () => {
        console.log('🧹 Cleaning up socket listeners');
        socket.off('new-like');
        socket.off('new-comment');
        socket.off('new-follower');
        socket.off('new-tip');
        socket.off('badge-cleared');
      };
    } catch (err) {
      console.error('❌ Error initializing socket:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [shouldConnect, addNotification, clearNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setEngagementNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );

    // Check if any unread notifications remain
    setEngagementNotifications((prev) => {
      const hasUnreadNotifs = prev.some((notif) => !notif.read);
      setHasUnread(hasUnreadNotifs);
      if (!hasUnreadNotifs) {
        setUnreadCount(0);
      }
      return prev;
    });
  }, []);

  /**
   * Remove a specific notification
   */
  const removeNotification = useCallback((notificationId) => {
    setEngagementNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  }, []);

  return {
    notifications: engagementNotifications,
    hasUnread,
    unreadCount,
    isLoading,
    error,
    addNotification,
    clearNotifications,
    markAsRead,
    removeNotification,
  };
};
