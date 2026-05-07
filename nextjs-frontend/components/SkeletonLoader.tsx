"use client";

import React from "react";

export function VideoCardSkeleton() {
  return (
    <div className="group block animate-fade-in">
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
        {}
        <div className="w-full h-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer" />

        {}
        <div className="absolute top-3 right-3 bg-zinc-950 rounded border border-zinc-700">
          <div className="h-5 w-12 bg-zinc-800 rounded" />
        </div>

        {}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-zinc-950/95 border-t border-zinc-800">
          <div className="flex items-end gap-3">
            {}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            {}
            <div className="flex-1 min-w-0 space-y-2">
              {}
              <div className="space-y-1">
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-5/6" />
              </div>

              {}
              <div className="flex items-center justify-between gap-2">
                <div className="h-2.5 bg-zinc-800 rounded w-2/5 flex-shrink-0" />
                <div className="h-2.5 bg-zinc-800 rounded w-1/4 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeedSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LoadMoreSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SingleVideoSkeleton() {
  return (
    <div className="space-y-6">
      {}
      <div className="w-full aspect-video rounded-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer" />

      {}
      <div className="space-y-3">
        <div className="h-6 bg-zinc-800 rounded w-3/4" />
        <div className="h-4 bg-zinc-800 rounded w-1/2" />
      </div>

      {}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
          <div className="h-2.5 bg-zinc-800 rounded w-1/4" />
        </div>
      </div>

      {}
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-5/6" />
      </div>
    </div>
  );
}

const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}
