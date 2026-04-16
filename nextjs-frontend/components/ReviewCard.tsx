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
  videoOwnerId,
  onDelete,
  onEdit,
}: ReviewCardProps) {
  const { user } = useAuth();
  const isOwner = user?._id === review.user._id;
  const isAdmin = user?.role === "admin";
  const canEdit = isOwner || isAdmin;

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
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-white font-bold">
            {review.user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{review.user.username}</p>
            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Edit and Delete buttons - visible only to owner or admin */}
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(review._id)}
              className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Delete
            </button>
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
