import { useState, useCallback, useEffect, useRef } from 'react';

interface Video {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  views: number;
  duration: number;
  category?: string;
  user: {
    _id: string;
    username: string;
    avatarKey?: string;
    bio?: string;
  };
  averageRating?: number;
  reviewCount?: number;
  likesCount?: number;
  createdAt?: string;
}

interface UseFeedResponse {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalCount: number;
}

type FeedType = 'trending' | 'following';

export const useFeed = (
  feedType: FeedType = 'trending',
  initialLimit: number = 20
): UseFeedResponse & { fetchMore: () => Promise<void>; resetFeed: () => Promise<void>; retry: () => Promise<void> } => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const fetchVideos = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      // Prevent duplicate requests while loading
      if (isLoadingRef.current) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Get JWT token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token && feedType === 'following') {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/videos/feed/${feedType}?page=${pageNum}&limit=${initialLimit}`,
          { headers }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required for following feed');
          }
          throw new Error(`Failed to fetch ${feedType} feed`);
        }

        const data = await response.json();

        if (reset) {
          setVideos(data.data.videos);
        } else {
          setVideos((prev) => [...prev, ...data.data.videos]);
        }

        setPage(pageNum);
        setTotalCount(data.data.totalCount);
        setHasMore(data.data.hasMore);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feed';
        setError(errorMessage);
        setHasMore(false);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [feedType, initialLimit]
  );

  const fetchMore = useCallback(async () => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce subsequent requests to prevent rapid-fire calls
    debounceTimerRef.current = setTimeout(() => {
      if (!isLoadingRef.current && hasMore) {
        fetchVideos(page + 1, false);
      }
    }, 300);
  }, [page, hasMore, fetchVideos]);

  const resetFeed = useCallback(async () => {
    setVideos([]);
    setPage(1);
    setError(null);
    setHasMore(true);
    await fetchVideos(1, true);
  }, [fetchVideos]);

  const retry = useCallback(async () => {
    setError(null);
    await resetFeed();
  }, [resetFeed]);

  // Auto-fetch on mount or when feedType changes
  useEffect(() => {
    resetFeed();
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [feedType, resetFeed]);

  return {
    videos,
    isLoading,
    error,
    hasMore,
    page,
    totalCount,
    fetchMore,
    resetFeed,
    retry,
  };
};
