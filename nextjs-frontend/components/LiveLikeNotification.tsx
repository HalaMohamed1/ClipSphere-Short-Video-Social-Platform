"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { onNewLike, onUnlike } from "../lib/socket";

interface LiveLike {
  id: string;
  liker: string;
  videoTitle: string;
  timestamp: number;
  type: "like" | "unlike";
  isNew: boolean;
}

export default function LiveLikeNotification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<LiveLike[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Listen for new likes
    const unsubscribeLike = onNewLike((data) => {
      const newNotification: LiveLike = {
        id: `${Date.now()}-like`,
        liker: data.liker,
        videoTitle: data.videoTitle,
        timestamp: Date.now(),
        type: "like",
        isNew: true,
      };
      
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10));

      // Auto-remove after 4 seconds
      const timeout = setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== newNotification.id)
        );
        timeoutRefs.current.delete(newNotification.id);
      }, 4000);

      timeoutRefs.current.set(newNotification.id, timeout);
    });

    // Listen for unlikes
    const unsubscribeUnlike = onUnlike((data) => {
      const newNotification: LiveLike = {
        id: `${Date.now()}-unlike`,
        liker: data.liker,
        videoTitle: data.videoTitle,
        timestamp: Date.now(),
        type: "unlike",
        isNew: true,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 10));

      // Auto-remove after 4 seconds
      const timeout = setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== newNotification.id)
        );
        timeoutRefs.current.delete(newNotification.id);
      }, 4000);

      timeoutRefs.current.set(newNotification.id, timeout);
    });

    return () => {
      unsubscribeLike();
      unsubscribeUnlike();
      // Clean up all timeouts
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, [user]);

  if (!user || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <NotificationBubble key={notification.id} notification={notification} />
      ))}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%) translateY(-10px);
          }
        }

        @keyframes pulse-heart {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1);
          }
        }

        .animate-slide-in {
          animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-slide-out {
          animation: slideOutRight 0.3s cubic-bezier(0.34, 0.64, 0.64, 1) forwards;
        }

        .animate-pulse-heart {
          animation: pulse-heart 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

interface NotificationBubbleProps {
  notification: LiveLike;
}

function NotificationBubble({ notification }: NotificationBubbleProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
  };

  const isLike = notification.type === "like";

  return (
    <div
      className={`${
        isExiting ? "animate-slide-out" : "animate-slide-in"
      } pointer-events-auto`}
    >
      <div className="relative overflow-hidden rounded-xl shadow-2xl border border-zinc-700/50 backdrop-blur-sm bg-gradient-to-r from-zinc-900 to-zinc-800">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />

        {/* Main content */}
        <div className="relative p-4 flex items-center gap-4">
          {/* Icon with pulse effect */}
          <div className="flex-shrink-0">
            {isLike ? (
              <div className="relative w-10 h-10 flex items-center justify-center animate-pulse-heart">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
                <svg
                  className="w-6 h-6 text-red-400 relative z-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-zinc-700/30 rounded-full">
                <svg
                  className="w-6 h-6 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-100">
              <span className="text-white font-bold">{notification.liker}</span>
              {isLike ? (
                <span className="text-zinc-300"> liked your video</span>
              ) : (
                <span className="text-zinc-300"> unliked your video</span>
              )}
            </p>
            <p className="text-xs text-zinc-400 mt-1 truncate">
              "{notification.videoTitle}"
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-700/30 rounded"
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-700/30">
          <div
            className={`h-full ${
              isLike ? "bg-red-500" : "bg-zinc-500"
            } transition-all duration-100`}
            style={{
              animation: "progress 4s linear forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
