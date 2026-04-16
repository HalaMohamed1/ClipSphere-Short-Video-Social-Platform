"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";

interface LikeButtonProps {
  videoId: string;
  onLikeChange?: (isLiked: boolean, count: number) => void;
  initialLiked?: boolean;
  initialCount?: number;
}

export default function LikeButton({
  videoId,
  onLikeChange,
  initialLiked = false,
  initialCount = 0,
}: LikeButtonProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleLikeClick = async () => {
    if (!user) {
      alert("Please log in to like videos");
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike
        await apiCall(`/videos/${videoId}/like`, { method: "DELETE" });
        setIsLiked(false);
        setLikeCount(Math.max(0, likeCount - 1));
        onLikeChange?.(false, Math.max(0, likeCount - 1));
      } else {
        // Like
        await apiCall(`/videos/${videoId}/like`, { method: "POST" });
        setIsLiked(true);
        setLikeCount(likeCount + 1);
        onLikeChange?.(true, likeCount + 1);
      }
    } catch (error) {
      console.error("Error liking video:", error);
      alert("Failed to update like. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
        isLiked
          ? "bg-zinc-800 text-zinc-100 border border-zinc-600 hover:bg-zinc-700"
          : "bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <svg
        className={`w-5 h-5 transition-transform ${isLiked ? "scale-110" : ""}`}
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}
