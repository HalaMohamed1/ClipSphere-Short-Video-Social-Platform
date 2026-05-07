"use client";

import React, { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";

export interface ProfileStats {
  videosCount: number;
  followersCount: number;
  followingCount: number;
}

interface ProfileCardProps {
  userId: string;
  username: string;
}

export default function ProfileCard({ userId, username }: ProfileCardProps) {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiCall<{ stats: ProfileStats }>(`/users/${userId}/stats`);
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch profile stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-3 text-zinc-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm">
      <div className="font-semibold text-zinc-100 mb-3">{username}</div>
      <div className="space-y-2 text-zinc-300">
        <div className="flex justify-between">
          <span>Videos:</span>
          <span className="font-semibold text-zinc-100">{stats.videosCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Followers:</span>
          <span className="font-semibold text-zinc-100">{stats.followersCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Following:</span>
          <span className="font-semibold text-zinc-100">{stats.followingCount}</span>
        </div>
      </div>
    </div>
  );
}
