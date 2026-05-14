import { Review } from '../db_core/models/Review.js';
import { Video } from '../db_core/models/Video.js';

/**
 * Recalculates and updates the trendingScore for a specific video.
 * Formula: (likesCount * 10) + (avgRating * 2) + freshnessBonus
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

    // 2. Fetch current likes, views, and creation date
    const video = await Video.findById(videoId).select('likesCount views createdAt');
    if (!video) return;

    const likesCount = video.likesCount || 0;
    
    // 3. Calculate freshness bonus (decreases by 1 per day, max 5)
    const daysSinceCreation = Math.floor((Date.now() - new Date(video.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const freshnessBonus = Math.max(0, 5 - daysSinceCreation);

    // 4. Calculate trending score using the correct formula
    // Total_Score = (Likes x 10) + (Avg_Rating x 2) + Freshness_Bonus
    const trendingScore = (likesCount * 10) + (avgRating * 2) + freshnessBonus;

    // 5. Update the video document
    await Video.findByIdAndUpdate(videoId, { trendingScore });

    console.log(`[Trending] Updated video ${videoId} score to ${trendingScore.toFixed(2)} (likes:${likesCount}, rating:${avgRating.toFixed(2)}, freshness:${freshnessBonus})`);
  } catch (error) {
    console.error(`[Trending] Failed to update score for video ${videoId}:`, error.message);
  }
}

/**
 * EXTENSION: This function should be called inside ReviewService.createReview
 * right after the review is created.
 */
