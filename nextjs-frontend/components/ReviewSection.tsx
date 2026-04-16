"use client";

import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";
import { useAuth } from "../hooks/useAuth";
import { apiCallWithAuth, apiCall } from "../lib/api";

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
  const { user, token } = useAuth();
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

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiCall(`/videos/${videoId}/reviews`, {
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

  // Fetch user's review if logged in
  useEffect(() => {
    if (user && token) {
      const fetchUserReview = async () => {
        try {
          const data = await apiCallWithAuth(
            `/videos/${videoId}/reviews/me`,
            token,
            { method: "GET" }
          );
          if (data) {
            setUserReview(data);
            setRating(data.rating);
            setComment(data.comment);
          }
        } catch (error) {
          console.error("Error fetching user review:", error);
        }
      };

      fetchUserReview();
    }
  }, [user, token, videoId]);

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
        // Update existing review
        await apiCallWithAuth(
          `/videos/reviews/${userReview._id}`,
          token,
          {
            method: "PATCH",
            body: JSON.stringify({ rating, comment }),
          }
        );
        setUserReview({ ...userReview, rating, comment });
      } else {
        // Create new review
        const newReview = await apiCallWithAuth(
          `/videos/${videoId}/reviews`,
          token,
          {
            method: "POST",
            body: JSON.stringify({ rating, comment }),
          }
        );
        setUserReview(newReview?.review || newReview);
      }

      // Refresh reviews list
      const updatedData = await apiCall(`/videos/${videoId}/reviews`, {
        method: "GET",
      });
      setReviews(updatedData?.reviews || []);
      setStats(updatedData?.stats || { averageRating: 0, totalReviews: 0 });

      setComment("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await apiCallWithAuth(
        `/videos/reviews/${reviewId}`,
        token,
        { method: "DELETE" }
      );

      setReviews(reviews.filter((r) => r._id !== reviewId));
      if (userReview?._id === reviewId) {
        setUserReview(null);
      }

      // Refresh stats
      const updatedData = await apiCall(`/videos/${videoId}/reviews`, {
        method: "GET",
      });
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
      {/* Rating Stats */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
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

        {/* Review Form */}
        {user && (
          <form onSubmit={handleSubmitReview} className="space-y-4 mt-6 pt-6 border-t border-white/10">
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
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum 3 characters required
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || comment.trim().length < 3}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-rose-500 text-white font-medium hover:from-purple-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
            </button>
          </form>
        )}

        {!user && (
          <p className="text-sm text-gray-400 mt-6 pt-6 border-t border-white/10">
            <a href="/login" className="text-purple-400 hover:text-purple-300">
              Log in
            </a>{" "}
            to leave a review
          </p>
        )}
      </div>

      {/* Reviews List */}
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
