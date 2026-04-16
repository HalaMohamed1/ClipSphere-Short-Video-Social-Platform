"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiCall } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export interface FeedVideo {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  user: {
    _id?: string;
    username?: string;
    name?: string;
    avatarKey?: string;
  };
  views: number;
  duration: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

type FeedTab = "discover" | "trending" | "following";

function formatDuration(sec: number) {
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Feed() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const searchQ = (searchParams.get("q") ?? "").trim();

  const [tab, setTab] = useState<FeedTab>("discover");
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (tab === "following" && !user) {
        setVideos([]);
        setPagination(null);
        setIsLoading(false);
        return;
      }

      if (append) setLoadingMore(true);
      else setIsLoading(true);

      try {
        const searchPart = searchQ
          ? `&search=${encodeURIComponent(searchQ)}`
          : "";
        let path: string;
        if (tab === "following") {
          path = `/videos/feed/following?page=${nextPage}&limit=12${searchPart}`;
        } else if (tab === "trending") {
          path = `/videos?feed=trending&page=${nextPage}&limit=12${searchPart}`;
        } else {
          path = `/videos?page=${nextPage}&limit=12${searchPart}`;
        }

        const data = await apiCall<{
          videos: FeedVideo[];
          pagination: Pagination;
        }>(path, { method: "GET" });

        const list = data?.videos || [];
        const pag = data?.pagination;

        setPagination(pag || null);
        if (append) {
          setVideos((prev) => [...prev, ...list]);
        } else {
          setVideos(list);
        }
        setPage(nextPage);
      } catch (e) {
        console.error(e);
        if (!append) setVideos([]);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [tab, user, searchQ]
  );

  useEffect(() => {
    setPage(1);
    loadPage(1, false);
  }, [tab, user, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || isLoading) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || loadingMore) return;
        if (!pagination) return;
        if (page >= (pagination.pages || 1)) return;

        void loadPage(page + 1, true);
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [isLoading, loadingMore, pagination, page, loadPage]);

  const tabLabel = (t: FeedTab) => {
    switch (t) {
      case "discover":
        return "Discover";
      case "trending":
        return "Trending";
      case "following":
        return "Following";
    }
  };

  if (tab === "following" && !user) {
    return (
      <div className="px-4 py-8 max-w-[1400px] mx-auto space-y-6">
        <FeedTabs tab={tab} setTab={setTab} />
        <p className="text-center text-gray-400 py-16">
          <Link href="/login" className="text-zinc-300 hover:text-white underline underline-offset-2">
            Log in
          </Link>{" "}
          to see videos from people you follow.
        </p>
      </div>
    );
  }

  if (isLoading && videos.length === 0) {
    return (
      <div className="px-4 py-8 max-w-[1400px] mx-auto">
        <FeedTabs tab={tab} setTab={setTab} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[9/16] rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-[1400px] mx-auto">
      <FeedTabs tab={tab} setTab={setTab} />

      <h2 className="text-xl font-semibold text-zinc-100 mb-8 border-b border-zinc-800 pb-3">
        {searchQ ? (
          <>
            Results for{" "}
            <span className="text-zinc-300 font-normal">&ldquo;{searchQ}&rdquo;</span>
            <span className="text-zinc-500 font-normal text-base ml-2">
              · {tabLabel(tab)}
            </span>
          </>
        ) : (
          <>{tabLabel(tab)} feed</>
        )}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => {
          const creator = video.user?.username || video.user?.name || "Creator";
          const hasThumb = Boolean(video.thumbnailUrl?.trim());
          return (
            <Link
              href={`/video/${video._id}`}
              key={video._id}
              className="group block"
            >
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 transition-colors group-hover:border-zinc-600">
                {hasThumb ? (
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-full min-h-[12rem] flex flex-col items-center justify-center gap-2 bg-zinc-800 text-zinc-500"
                    aria-hidden
                  >
                    <svg
                      className="w-12 h-12 opacity-50"
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
                    <span className="text-[11px] font-medium">No thumbnail</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                <div className="absolute top-3 right-3 bg-zinc-950 text-zinc-300 text-[11px] font-medium px-2 py-1 rounded border border-zinc-700">
                  {formatDuration(video.duration || 0)}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 flex items-end gap-3 bg-zinc-950/95 border-t border-zinc-800">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-200 border border-zinc-600">
                      {creator.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-zinc-100 font-medium text-sm leading-snug mb-1.5 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="truncate pr-2">{creator}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        {video.views > 1000
                          ? `${(video.views / 1000).toFixed(1)}k`
                          : video.views}{" "}
                        views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div ref={sentinelRef} className="h-12 w-full flex justify-center py-8">
        {loadingMore && (
          <div className="text-gray-500 text-sm animate-pulse">Loading more…</div>
        )}
      </div>

      {!isLoading && videos.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          {searchQ
            ? "No videos match your search. Try different keywords."
            : "No videos to show yet."}
        </p>
      )}
    </div>
  );
}

function FeedTabs({
  tab,
  setTab,
}: {
  tab: FeedTab;
  setTab: (t: FeedTab) => void;
}) {
  const tabs: FeedTab[] = ["discover", "trending", "following"];
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTab(t)}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            tab === t
              ? "bg-zinc-100 text-zinc-950 border-zinc-100"
              : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
          }`}
        >
          {t === "discover" ? "Discover" : t === "trending" ? "Trending" : "Following"}
        </button>
      ))}
    </div>
  );
}
