import { catchAsync } from '../utils/catchAsync.js';
import { ReviewController } from './reviewController.js';
import { VideoController } from './videoController.js';
import { updateVideoTrendingScore } from '../extensions/trendingScoreExtension.js';
import { getFollowingBoostFeed } from '../extensions/feedExtension.js';
import { ReviewService } from '../services/reviewService.js';
import { Video } from '../db_core/models/Video.js';
import { User } from '../db_core/models/User.js';
import { emitNewReview } from '../io/socketManager.js';

export class EnhancedController {
  /**
   * Enhanced Review Creation:
   * Recalculates trendingScore after a review is submitted.
   */
  static createReview = catchAsync(async (req, res) => {
    // 1. Call original logic (re-implemented here to avoid circular dependency or complex wrapping)
    const reviewData = {
      ...req.body,
      user: req.user._id,
      video: req.params.videoId,
    };

    const review = await ReviewService.createReview(reviewData);

    // 2. Background task: Recalculate trending score
    // We don't await this to keep response fast
    updateVideoTrendingScore(req.params.videoId);

    // 3. Socket emission (mirrored from original controller)
    const video = await Video.findById(req.params.videoId).populate('user', '_id');
    const reviewer = await User.findById(req.user._id).select('username');

    if (video && video.user) {
      emitNewReview(video.user._id, {
        reviewerId: req.user._id,
        reviewerUsername: reviewer?.username || 'Anonymous',
        rating: req.body.rating,
        comment: req.body.comment,
        videoId: req.params.videoId,
        videoTitle: video.title,
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully with trending update',
      data: { review },
    });
  });

  /**
   * Enhanced Feed: Following Boost
   */
  static getEnhancedFeed = catchAsync(async (req, res) => {
    const result = await getFollowingBoostFeed(req.user._id, req.query);

    res.status(200).json({
      status: 'success',
      message: 'Enhanced feed retrieved (Following Boost active)',
      data: result,
    });
  });
}
