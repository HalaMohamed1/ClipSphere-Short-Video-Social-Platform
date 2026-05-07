"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiCall } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import FollowButton from "../../../components/FollowButton";

interface UserProfile {
  _id: string;
  username: string;
  bio?: string;
  avatarKey?: string;
  followersCount?: number;
  followingCount?: number;
}

interface Video {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  views: number;
  duration: number;
}

function formatDuration(sec: number) {
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user by username
        const userData = await apiCall<{ user?: UserProfile; data?: { user?: UserProfile } }>(
          `/users/username/${username}`,
          { method: "GET" }
        );

        const userProfile = userData?.user || userData?.data?.user;

        if (userProfile) {
          setProfile(userProfile);
          await fetchUserData(userProfile._id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserData = async (userId: string) => {
      try {
        // Fetch followers
        const followersData = await apiCall<{
          pagination?: { total: number };
        }>(`/users/${userId}/followers`, { method: "GET" });
        setFollowersCount(followersData?.pagination?.total || 0);

        // Fetch following
        const followingData = await apiCall<{
          pagination?: { total: number };
        }>(`/users/${userId}/following`, { method: "GET" });
        setFollowingCount(followingData?.pagination?.total || 0);

        // Fetch user's videos
        const videosData = await apiCall<{ videos?: Video[] }>(
          `/videos?userId=${userId}&limit=50`,
          { method: "GET" }
        );
        setVideos(videosData?.videos || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8 animate-pulse">
          <div className="h-40 bg-zinc-900 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="space-y-6 border-b border-zinc-800 pb-8">
        <div className="flex items-start gap-8 flex-wrap">
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-4xl font-medium text-zinc-200">
            {profile.username.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 flex-wrap mb-4">
              <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
              <FollowButton userId={profile._id} />
            </div>

            {profile.bio && (
              <p className="text-gray-300 mb-6">{profile.bio}</p>
            )}

            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-zinc-400">Videos</p>
                <p className="text-white font-semibold text-lg">
                  {videos.length}
                </p>
              </div>
              <Link href={`#followers`}>
                <div className="hover:opacity-80 transition-opacity cursor-pointer">
                  <p className="text-zinc-400">Followers</p>
                  <p className="text-white font-semibold text-lg">
                    {followersCount.toLocaleString()}
                  </p>
                </div>
              </Link>
              <Link href={`#following`}>
                <div className="hover:opacity-80 transition-opacity cursor-pointer">
                  <p className="text-zinc-400">Following</p>
                  <p className="text-white font-semibold text-lg">
                    {followingCount.toLocaleString()}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link href={`/video/${video._id}`} key={video._id} className="group">
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                      <svg
                        className="w-12 h-12 text-zinc-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                  <div className="absolute top-3 right-3 bg-zinc-950 text-zinc-300 text-[11px] font-medium px-2 py-1 rounded border border-zinc-700">
                    {formatDuration(video.duration || 0)}
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-3 bg-zinc-950/95 border-t border-zinc-800">
                    <h3 className="text-zinc-100 font-medium text-sm leading-snug mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="text-[11px] text-zinc-400">
                      {video.views > 1000
                        ? `${(video.views / 1000).toFixed(1)}k`
                        : video.views}{" "}
                      views
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No videos yet</p>
        </div>
      )}
    </div>
  );
}
