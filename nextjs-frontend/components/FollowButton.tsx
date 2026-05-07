"use client";

import React, { useState, useEffect } from "react";
import { apiCall } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  onFollowChange,
}: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if current user is following this user
  useEffect(() => {
    if (!user || user._id === userId) {
      setIsCheckingStatus(false);
      return;
    }

    const checkFollowing = async () => {
      try {
        // Get current user's following list
        const response = await apiCall<{
          users: Array<{ _id: string; username: string }>;
          pagination: { total: number };
        }>(`/users/${user._id}/following`, { method: "GET" });

        // Check if userId is in the current user's following list
        const isUserFollowing = response?.users?.some(
          (followedUser) => followedUser._id === userId
        );
        setIsFollowing(isUserFollowing || false);
      } catch (err) {
        console.error("Error checking follow status:", err);
        // Fall back to initial value if check fails
        setIsFollowing(initialFollowing);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFollowing();
  }, [user, userId, initialFollowing]);

  if (!user || user._id === userId) {
    // Don't show follow button for own profile or when not logged in
    return null;
  }

  const handleFollowClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        // Unfollow
        await apiCall(`/users/${userId}/unfollow`, {
          method: "DELETE",
        });
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        // Follow
        await apiCall(`/users/${userId}/follow`, {
          method: "POST",
        });
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to update follow status";
      setError(errorMsg);
      console.error("Follow error:", err);
      // Revert to previous state on error
      setIsFollowing(!isFollowing);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleFollowClick}
        disabled={isLoading || isCheckingStatus}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          isFollowing
            ? "bg-zinc-800 border border-zinc-600 text-zinc-200 hover:bg-zinc-700"
            : "bg-zinc-100 text-zinc-950 hover:bg-white border border-zinc-100"
        } ${isLoading || isCheckingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isCheckingStatus ? "..." : isLoading ? "..." : isFollowing ? "Following" : "Follow"}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
