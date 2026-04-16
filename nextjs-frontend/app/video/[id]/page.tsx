"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoPlayer from "../../../components/VideoPlayer";
import LikeButton from "../../../components/LikeButton";
import ReviewSection from "../../../components/ReviewSection";
import { apiCall } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

interface VideoUser {
  _id: string;
  username: string;
  avatarKey?: string;
  bio?: string;
}

function isVideoOwner(
  user: { _id: string; role?: string } | null | undefined,
  video: Video | null
): boolean {
  return Boolean(
    user && video && String(user._id) === String(video.user._id)
  );
}

/** SWAPD352: edit metadata = owner only; delete = owner or admin */
function canEditVideo(
  user: { _id: string; role?: string } | null | undefined,
  video: Video | null
): boolean {
  return isVideoOwner(user, video);
}

function canDeleteVideo(
  user: { _id: string; role?: string } | null | undefined,
  video: Video | null
): boolean {
  if (!user || !video) return false;
  return isVideoOwner(user, video) || user.role === "admin";
}

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  user: VideoUser;
  views: number;
  likesCount: number;
  duration: number;
  category: string;
  createdAt: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const { user, refresh } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await apiCall<{ video: Video }>(`/videos/${videoId}`, {
          method: "GET",
        });
        const v = data.video;
        setVideo(v);
        setLikeCount(v?.likesCount || 0);
        setEditTitle(v.title);
        setEditDescription(v.description || "");
      } catch (error) {
        console.error("Error fetching video:", error);
        setVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    if (!user || !videoId) return;

    const checkLiked = async () => {
      try {
        const data = await apiCall<{ isLiked: boolean }>(
          `/videos/${videoId}/like/check`,
          { method: "GET" }
        );
        setIsLiked(data?.isLiked || false);
      } catch {
        setIsLiked(false);
      }
    };

    checkLiked();
  }, [user, videoId]);

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

  const canEdit = canEditVideo(user, video);
  const canDelete = canDeleteVideo(user, video);

  useEffect(() => {
    if (!canEdit) {
      setEditing(false);
      if (video) {
        setEditTitle(video.title);
        setEditDescription(video.description || "");
      }
    }
  }, [canEdit, video]);

  const handleSaveEdit = async () => {
    if (!video) return;
    setSaving(true);
    try {
      const updated = await apiCall<{ video: Video }>(`/videos/${video._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });
      setVideo(updated.video);
      setEditing(false);
      await refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!video || !confirm("Delete this video permanently?")) return;
    try {
      await apiCall(`/videos/${video._id}`, { method: "DELETE" });
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("Failed to delete video");
    }
  };

  const copyShareLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    void navigator.clipboard.writeText(url);
    alert("Link copied");
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
      <VideoPlayer
        src={video.videoUrl}
        thumbnail={video.thumbnailUrl}
        onViewIncrement={handleViewIncrement}
      />

      <div className="space-y-4">
        {editing && canEdit ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-white text-xl font-semibold"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 text-sm font-medium hover:bg-white"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditTitle(video.title);
                  setEditDescription(video.description || "");
                }}
                className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-bold text-white">{video.title}</h1>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-white/10 pb-4">
          <span>{video.views.toLocaleString()} views</span>
          <span>•</span>
          <span>{formatDate(video.createdAt)}</span>
          <span>•</span>
          <span className="capitalize px-2 py-1 bg-white/5 rounded text-gray-300">
            {video.category}
          </span>
          <span>•</span>
          <span>{video.duration}s</span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-100 font-medium text-lg">
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

          <div className="flex gap-3 flex-wrap">
            <LikeButton
              videoId={videoId}
              initialLiked={isLiked}
              initialCount={likeCount}
              onLikeChange={(liked, count) => {
                setIsLiked(liked);
                setLikeCount(count);
              }}
            />
            <button
              type="button"
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 font-medium transition-colors"
            >
              Share
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-sm font-medium hover:bg-zinc-700"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteVideo}
                className="px-4 py-2 rounded-md border border-red-900/40 text-red-400/90 text-sm font-medium hover:bg-red-950/30"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {video.description && !editing && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {video.description}
            </p>
          </div>
        )}
      </div>

      <ReviewSection videoId={videoId} videoOwnerId={video.user._id} />
    </div>
  );
}
