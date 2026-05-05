import mongoose from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       required:
 *         - user
 *         - video
 *       properties:
 *         user:
 *           type: string
 *           description: The ID of the user who liked the video.
 *         video:
 *           type: string
 *           description: The ID of the video being liked.
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Like must belong to a user'],
    },
    video: {
      type: mongoose.Schema.ObjectId,
      ref: 'Video',
      required: [true, 'Like must belong to a video'],
    },
  },
  { timestamps: true }
);

// Unique index to ensure a user can only like a video once
likeSchema.index({ user: 1, video: 1 }, { unique: true });

// Index for efficient queries of likes by video
likeSchema.index({ video: 1, createdAt: -1 });

// Index for efficient queries of likes by user
likeSchema.index({ user: 1, createdAt: -1 });

export const Like = mongoose.model('Like', likeSchema);
