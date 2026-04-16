"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VideoPlayer from "../../../components/VideoPlayer";
import LikeButton from "../../../components/LikeButton";
import ReviewSection from "../../../components/ReviewSection";
import { apiCall, apiCallWithAuth } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  user: {
    _id: string;
    username: string;
    avatarKey?: string;
    bio?: string;
  };
  views: number;
  likesCount: number;
  duration: number;
  category: string;
  createdAt: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  const { user, token } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Fetch video details
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await apiCall(`/videos/${videoId}`, { method: "GET" });
        setVideo(data);
        setLikeCount(data?.likesCount || 0);
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  // Check if user liked the video
  useEffect(() => {
    if (user && token && videoId) {
      const checkLiked = async () => {
        try {
          const data = await apiCallWithAuth(
            `/videos/${videoId}/like/check`,
            token,
            { method: "GET" }
          );
          setIsLiked(data?.isLiked || false);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      };

      checkLiked();
    }
  }, [user, token, videoId]);

  // Increment view count
  const handleViewIncrement = async () => {
    try {
      await apiCall(`/videos/${videoId}/increment-views`, {
        method: "PATCH",
      });
      if (video) {
        setVideo({ ...video, views: video.views + 1 });
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/5 rounded-2xl aspect-video animate-pulse" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">Video not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Video Player */}
      <VideoPlayer
        src={video.videoUrl}
        thumbnail={video.thumbnailUrl}
        onViewIncrement={handleViewIncrement}
      />

      {/* Video Info */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">{video.title}</h1>

        {/* Video Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-white/10 pb-4">
          <span>{video.views.toLocaleString()} views</span>
          <span>•</span>
          <span>{formatDate(video.createdAt)}</span>
          <span>•</span>
          <span className="capitalize px-2 py-1 bg-white/5 rounded text-gray-300">
            {video.category}
          </span>
        </div>

        {/* Channel Info and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
              {video.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-lg">
                {video.user.username}
              </p>
              {video.user.bio && (
                <p className="text-sm text-gray-400">{video.user.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <LikeButton
              videoId={videoId}
              initialLiked={isLiked}
              initialCount={likeCount}
              onLikeChange={(liked, count) => {
                setIsLiked(liked);
                setLikeCount(count);
              }}
            />
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium transition-all">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C9.922 10.938 11.953 9 14.5 9M9 3l6 6m0 0l6-6m-6 6v12m0 0l-6-6m6 6l6-6"
                />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Description */}
        {video.description && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {video.description}
            </p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <ReviewSection videoId={videoId} videoOwnerId={video.user._id} />
    </div>
  );
}
