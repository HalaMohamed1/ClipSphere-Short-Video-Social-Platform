"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Feed from "@/components/Feed";
import { useAuth } from "@/hooks/useAuth";
import { useFeed } from "@/hooks/useFeed";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [feedType, setFeedType] = useState<"trending" | "following">("trending");
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { videos, isLoading, error, hasMore, fetchMore, retry } = useFeed(feedType, 20);

  useEffect(() => {
    setAllVideos(videos);
  }, [videos, feedType]);

  const handleFeedTypeChange = (newType: "trending" | "following") => {
    setFeedType(newType);
    setAllVideos([]);
  };

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      await fetchMore();
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 mb-6 text-sm text-white/60">
        <p className="text-center sm:text-left">
          Short video feed. Test MinIO uploads (JWT):{" "}
          <Link
            href="/upload"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Upload
          </Link>
        </p>
      </div>

      <div className="flex gap-4 mb-8 justify-center items-center">
        <button
          onClick={() => handleFeedTypeChange("trending")}
          aria-label="Show trending videos"
          aria-pressed={feedType === "trending"}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            feedType === "trending"
              ? "bg-black text-white border-2 border-white shadow-lg shadow-white/20"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          🔥 Trending
        </button>

        <button
          onClick={() => handleFeedTypeChange("following")}
          disabled={!isAuthenticated}
          aria-label="Show videos from users you follow"
          aria-pressed={feedType === "following"}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            feedType === "following"
              ? "bg-black text-white border-2 border-white shadow-lg shadow-white/20"
              : isAuthenticated
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-900 text-gray-600 cursor-not-allowed"
          }`}
          title={!isAuthenticated ? "Sign in to view following feed" : ""}
        >
          👥 Following
        </button>
      </div>

      {error && (
        <div
          className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200 text-center"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="mb-3">{error}</p>
          {feedType === "following" && !isAuthenticated && (
            <p className="text-sm mb-3">Sign in to view videos from users you follow</p>
          )}
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors"
            aria-label="Retry loading feed"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && allVideos.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">
            {feedType === "trending"
              ? "No videos yet. Check back soon!"
              : "No videos from users you follow. Follow some users to see their content!"}
          </p>
        </div>
      )}

      {allVideos.length > 0 && (
        <Feed
          videos={allVideos}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      )}

      {isLoading && allVideos.length === 0 && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin">
            <div
              className="h-12 w-12 border-4 border-gray-600 border-t-white rounded-full"
              role="status"
              aria-label="Loading videos"
            />
          </div>
        </div>
      )}
    </div>
  );
}
