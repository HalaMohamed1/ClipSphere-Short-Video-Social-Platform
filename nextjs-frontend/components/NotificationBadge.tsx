'use client';

import React from 'react';

/**
 * NotificationBadge Component
 * Displays a red badge with unread count over the Activity icon
 * Shows a persistent red dot when there are unread notifications
 *
 * @param {number} unreadCount - Number of unread notifications
 * @param {boolean} hasUnread - Whether there are any unread notifications
 */
export const NotificationBadge = ({ unreadCount = 0, hasUnread = false }) => {
  if (!hasUnread && unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Red dot indicator when there are unread notifications */}
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}

      {/* Badge with unread count */}
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * ActivityIcon Component
 * Icon container for the activity/notification center in navbar
 * Includes the badge overlay
 */
export const ActivityIcon = ({ unreadCount = 0, hasUnread = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      aria-label="Activity notifications"
    >
      {/* Bell icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Badge overlay */}
      <NotificationBadge unreadCount={unreadCount} hasUnread={hasUnread} />
    </button>
  );
};

export default NotificationBadge;
