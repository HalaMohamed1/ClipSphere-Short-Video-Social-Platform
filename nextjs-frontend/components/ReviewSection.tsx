"use client";

import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";

interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatarKey?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  isEdited?: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface ReviewSectionProps {
  videoId: string;
  videoOwnerId: string;
}

export default function ReviewSection({
  videoId,
  videoOwnerId,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiCall<{
          reviews: Review[];
          stats: ReviewStats;
          pagination: unknown;
        }>(`/videos/${videoId}/reviews`, {
          method: "GET",
        });
        setReviews(data?.reviews || []);
        setStats(data?.stats || { averageRating: 0, totalReviews: 0 });
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [videoId]);

  useEffect(() => {
    if (!user) return;

    const fetchUserReview = async () => {
      try {
        const data = await apiCall<{ review: Review | null }>(
          `/videos/${videoId}/reviews/me`,
          { method: "GET" }
        );
        if (data?.review) {
          setUserReview(data.review);
          setRating(data.review.rating);
          setComment(data.review.comment);
        } else {
          setUserReview(null);
        }
      } catch {
        setUserReview(null);
      }
    };

    fetchUserReview();
  }, [user, videoId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to leave a review");
      return;
    }

    if (comment.trim().length < 3) {
      alert("Comment must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      if (userReview) {
        await apiCall(`/videos/reviews/${userReview._id}`, {
          method: "PATCH",
          body: JSON.stringify({ rating, comment }),
        });
        setUserReview({ ...userReview, rating, comment });
      } else {
        const newReview = await apiCall<{ review: Review }>(
          `/videos/${videoId}/reviews`,
          {
            method: "POST",
            body: JSON.stringify({ rating, comment }),
          }
        );
        setUserReview(newReview.review);
      }

      const updatedData = await apiCall<{
        reviews: Review[];
        stats: ReviewStats;
      }>(`/videos/${videoId}/reviews`, {
        method: "GET",
      });
      setReviews(updatedData?.reviews || []);
      setStats(updatedData?.stats || { averageRating: 0, totalReviews: 0 });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await apiCall(`/videos/reviews/${reviewId}`, { method: "DELETE" });

      setReviews(reviews.filter((r) => r._id !== reviewId));
      if (userReview?._id === reviewId) {
        setUserReview(null);
        setComment("");
        setRating(5);
      }

      const updatedData = await apiCall<{ stats: ReviewStats }>(
        `/videos/${videoId}/reviews`,
        { method: "GET" }
      );
      setStats(updatedData?.stats || { averageRating: 0, totalReviews: 0 });
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Reviews & Ratings</h3>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-white">
                {stats.averageRating.toFixed(1)}
              </span>
              <StarRating
                value={Math.round(stats.averageRating)}
                onChange={() => {}}
                readonly
              />
            </div>
            <p className="text-gray-400 text-sm">
              Based on {stats.totalReviews} review
              {stats.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {user && (
          <form
            onSubmit={handleSubmitReview}
            className="space-y-4 mt-6 pt-6 border-t border-zinc-800"
          >
            <h4 className="text-sm font-semibold text-white">
              {userReview ? "Edit your review" : "Leave a review"}
            </h4>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Rating</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this video..."
                className="w-full px-4 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum 3 characters required
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || comment.trim().length < 3}
              className="px-6 py-2 rounded-md bg-zinc-100 text-zinc-950 font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Submitting..."
                : userReview
                  ? "Update Review"
                  : "Submit Review"}
            </button>
          </form>
        )}

        {!user && (
          <p className="text-sm text-gray-400 mt-6 pt-6 border-t border-zinc-800">
            <a href="/login" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
              Log in
            </a>{" "}
            to leave a review
          </p>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white">All Reviews</h4>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                videoOwnerId={videoOwnerId}
                onDelete={() => handleDeleteReview(review._id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">
          No reviews yet. Be the first to review this video!
        </p>
      )}
    </div>
  );
}
