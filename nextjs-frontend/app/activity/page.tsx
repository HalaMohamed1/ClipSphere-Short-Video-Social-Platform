'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEngagementHub } from '@/hooks/useEngagementHub';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'follow':
      return '👤';
    case 'tip':
      return '💰';
    default:
      return '🔔';
  }
};

const getNotificationMessage = (notification) => {
  switch (notification.type) {
    case 'like':
      return `${notification.senderUsername} liked "${notification.videoTitle}"`;
    case 'comment':
      return `${notification.senderUsername} commented on "${notification.videoTitle}"`;
    case 'follow':
      return `${notification.senderUsername} started following you`;
    case 'tip':
      return `${notification.senderUsername} tipped you $${notification.amount}`;
    default:
      return 'New notification';
  }
};

export default function ActivityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { notifications, clearNotifications } = useEngagementHub(!!user);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="h-64 bg-zinc-900 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pt-20 pb-10 min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Activity</h1>
          <p className="text-zinc-400">
            {notifications.length === 0
              ? 'No notifications yet'
              : `You have ${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Clear button */}
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="mb-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md transition-colors"
          >
            Clear All Notifications
          </button>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-zinc-400 mb-4">No notifications yet</p>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to Feed
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => {
                  if (notification.videoId) {
                    router.push(`/video/${notification.videoId}`);
                  } else if (notification.senderId) {
                    router.push(`/user/${notification.senderId}`);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white break-words">
                      {getNotificationMessage(notification)}
                    </p>
                    {notification.message && (
                      <p className="text-zinc-400 text-sm mt-1 truncate">
                        &quot;{notification.message}&quot;
                      </p>
                    )}
                    <p className="text-zinc-500 text-xs mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Badge for unread */}
                  {!notification.read && (
                    <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
