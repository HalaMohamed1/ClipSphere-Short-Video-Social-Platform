import { Review } from '../db_core/models/Review.js';
import { Video } from '../db_core/models/Video.js';
import { User } from '../db_core/models/User.js';
import { AppError } from '../utils/appError.js';
import { sendEngagementNotification } from '../utils/engagementNotificationUtil.js';

export class ReviewService {
  static async createReview(reviewData) {
    const video = await Video.findById(reviewData.video);
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    const existingReview = await Review.findOne({
      user: reviewData.user,
      video: reviewData.video,
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this video. You can update your review instead.', 400);
    }

    const review = await Review.create(reviewData);
    const populatedReview = await review.populate([
      { path: 'user', select: 'username avatarKey' },
      { path: 'video', select: 'title user' },
    ]);

    // Send engagement notification to video owner
    if (video.user && video.user.toString() !== reviewData.user.toString()) {
      const reviewer = await User.findById(reviewData.user).select('username');
      await sendEngagementNotification(
        video.user,
        'review',
        reviewer?.username || 'Someone',
        video.title,
        reviewData.video.toString()
      );
    }

    return populatedReview;
  }

  static async getVideoReviews(videoId, options = {}) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    const skip = (options.page - 1) * options.limit || 0;

    const reviews = await Review.find({ video: videoId })
      .populate('user', 'username avatarKey')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit || 10);

    const total = await Review.countDocuments({ video: videoId });

    const ratingStats = await Review.aggregate([
      { $match: { video: video._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return {
      reviews,
      stats: ratingStats[0] || { averageRating: 0, totalReviews: 0 },
      pagination: {
        total,
        page: options.page || 1,
        limit: options.limit || 10,
        pages: Math.ceil(total / (options.limit || 10)),
      },
    };
  }

  static async getReviewById(reviewId) {
    const review = await Review.findById(reviewId).populate([
      { path: 'user', select: 'username avatarKey' },
      { path: 'video', select: 'title' },
    ]);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }

  static async updateReview(reviewId, updateData) {
    const review = await Review.findByIdAndUpdate(reviewId, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'user', select: 'username avatarKey' },
      { path: 'video', select: 'title' },
    ]);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }

  static async deleteReview(reviewId) {
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }

  static async getUserVideoReview(userId, videoId) {
    const review = await Review.findOne({ user: userId, video: videoId }).populate([
      { path: 'user', select: 'username avatarKey' },
      { path: 'video', select: 'title' },
    ]);

    return review;
  }
}
