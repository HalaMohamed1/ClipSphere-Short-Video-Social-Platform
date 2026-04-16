"use client";

import React from "react";
import StarRating from "./StarRating";
import { useAuth } from "../hooks/useAuth";

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

interface ReviewCardProps {
  review: Review;
  videoOwnerId: string;
  onDelete?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
}

export default function ReviewCard({
  review,
  onDelete,
  onEdit,
}: ReviewCardProps) {
  const { user } = useAuth();
  const isReviewAuthor = Boolean(
    user && String(user._id) === String(review.user._id)
  );
  const isAdmin = user?.role === "admin";
  /** SWAPD352 / API: delete = author or admin; update review = author only */
  const canEdit = isReviewAuthor;
  const canDelete = isReviewAuthor || isAdmin;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this review?")) {
      onDelete?.(review._id);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-200 font-medium text-sm">
            {review.user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{review.user.username}</p>
            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {(canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit?.(review._id)}
                className="text-xs px-2 py-1 rounded border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs px-2 py-1 rounded border border-red-900/50 text-red-400/90 hover:bg-red-950/40 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-3">
        <StarRating value={review.rating} onChange={() => {}} readonly size="sm" />
        {review.isEdited && (
          <p className="text-xs text-gray-400 mt-1">Edited</p>
        )}
      </div>

      <p className="text-gray-300 text-sm leading-relaxed break-words">
        {review.comment}
      </p>
    </div>
  );
}
