"use client";

import React, { useState, useEffect, useRef } from "react";
import { onNewLike, onNewFollower, onNewReview, onNewTip, EngagementEvent } from "@/lib/socket";

export interface Notification {
  id: string;
  type: "like" | "follow" | "review" | "tip";
  message: string;
  timestamp: string;
  read: boolean;
  data: EngagementEvent;
}

export default function NotificationIcon() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Subscribe to real-time events
    const unsubscribeLike = onNewLike((data) => {
      const notification: Notification = {
        id: `like-${data.timestamp}`,
        type: "like",
        message: `${data.liker} liked your video "${data.videoTitle}"`,
        timestamp: data.timestamp,
        read: false,
        data,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    });

    const unsubscribeFollow = onNewFollower((data) => {
      const notification: Notification = {
        id: `follow-${data.timestamp}`,
        type: "follow",
        message: `${data.followerUsername} started following you`,
        timestamp: data.timestamp,
        read: false,
        data,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    const unsubscribeReview = onNewReview((data) => {
      const notification: Notification = {
        id: `review-${data.timestamp}`,
        type: "review",
        message: `${data.reviewerUsername} reviewed your video "${data.videoTitle}"`,
        timestamp: data.timestamp,
        read: false,
        data,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    const unsubscribeTip = onNewTip((data) => {
      const notification: Notification = {
        id: `tip-${data.timestamp}`,
        type: "tip",
        message: `${data.tipperUsername} tipped you $${data.amount} on "${data.videoTitle}"`,
        timestamp: data.timestamp,
        read: false,
        data,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    return () => {
      unsubscribeLike();
      unsubscribeFollow();
      unsubscribeReview();
      unsubscribeTip();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const markAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️";
      case "follow":
        return "👤";
      case "review":
        return "⭐";
      case "tip":
        return "💰";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            markAsRead();
          }
        }}
        className="relative p-2 text-zinc-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
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
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-100">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-zinc-400 text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-zinc-800 transition-colors ${
                    !notification.read ? "bg-zinc-800/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-100 break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
