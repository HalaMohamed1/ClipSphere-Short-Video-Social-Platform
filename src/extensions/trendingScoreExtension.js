import { Review } from '../db_core/models/Review.js';
import { Video } from '../db_core/models/Video.js';

/**
 * Recalculates and updates the trendingScore for a specific video.
 * Formula: (avgRating * 4) + (likesCount * 0.1) + (views * 0.01)
 * 
 * @param {string} videoId - The ID of the video to update.
 */
export async function updateVideoTrendingScore(videoId) {
  try {
    // 1. Calculate average rating
    const stats = await Review.aggregate([
      { $match: { video: videoId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const avgRating = stats[0]?.averageRating || 0;

    // 2. Fetch current likes and views
    const video = await Video.findById(videoId).select('likesCount views');
    if (!video) return;

    const likesCount = video.likesCount || 0;
    const views = video.views || 0;

    // 3. Calculate trending score
    const trendingScore = (avgRating * 4) + (likesCount * 0.1) + (views * 0.01);

    // 4. Update the video document
    await Video.findByIdAndUpdate(videoId, { trendingScore });

    console.log(`[Trending] Updated video ${videoId} score to ${trendingScore.toFixed(4)}`);
  } catch (error) {
    console.error(`[Trending] Failed to update score for video ${videoId}:`, error.message);
  }
}

/**
 * EXTENSION: This function should be called inside ReviewService.createReview
 * right after the review is created.
 */
