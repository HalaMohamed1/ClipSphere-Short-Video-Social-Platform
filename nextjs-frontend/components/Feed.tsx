"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";

export interface Video {
  _id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl?: string;
  views: number;
  duration: number;
  category?: string;
  user: {
    _id?: string;
    username: string;
    avatarKey?: string;
    bio?: string;
  };
  averageRating?: number;
  likesCount?: number;
  createdAt?: string;
}

interface FeedProps {
  videos: Video[];
  isLoadingMore?: boolean;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
}

export default function Feed({ videos, isLoadingMore = false, onLoadMore, hasMore = false }: FeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Format view count
  const formatViews = (views: number) => {
    if (views > 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views > 1000) return `${(views / 1000).toFixed(1)}k`;
    return views;
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="px-4 py-8 max-w-350 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Link href={`/video/${video._id}`} key={video._id} className="group block" aria-label={`${video.title} by ${video.user.username} - ${formatViews(video.views)} views`}>
            <div className="relative aspect-9/16 rounded-3xl overflow-hidden bg-black border border-white/5 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.1)] group-hover:border-white/10">
              
              <img 
                src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=800&fit=crop'} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/95 pointer-events-none" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                {formatDuration(video.duration)}
              </div>

              <div className="absolute bottom-0 left-0 w-full p-5 flex items-end gap-3 transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full border-2 border-white/20 shadow-xl object-cover bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm">
                    {video.user.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm leading-snug drop-shadow-lg mb-1.5 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-300">
                    <span className="truncate pr-2">{video.user.username}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatViews(video.views)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="h-4 mt-8" />

      {/* Loading indicator for next page */}
      {isLoadingMore && (
        <div 
          className="flex justify-center items-center py-8"
          role="status"
          aria-live="polite"
          aria-label="Loading more videos"
        >
          <div className="animate-spin">
            <div className="h-8 w-8 border-3 border-gray-600 border-t-white rounded-full"></div>
          </div>
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && videos.length > 0 && (
        <div 
          className="text-center py-8 text-gray-500"
          role="status"
          aria-live="polite"
          aria-label="No more videos available"
        >
          <p>No more videos to load</p>
        </div>
      )}
    </div>
  );
}
