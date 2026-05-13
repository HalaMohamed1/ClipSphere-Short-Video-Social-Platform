import { Video } from '../db_core/models/Video.js';
import { Follower } from '../db_core/models/Follower.js';

/**
 * Retrieves an enhanced feed with "Following Boost":
 * 1. Shows followed-user videos first.
 * 2. Followed by remaining public videos sorted by trendingScore descending.
 * 
 * @param {string} userId - The ID of the user requesting the feed.
 * @param {object} options - Pagination options { page, limit }.
 */
export async function getFollowingBoostFeed(userId, options = {}) {
  const limit = Math.min(parseInt(options.limit, 10) || 20, 100);
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const skip = (page - 1) * limit;

  // 1. Get the list of people the user follows
  const following = await Follower.find({ follower: userId }).select('following').lean();
  const followingIds = following.map(f => f.following);

  // 2. Build the aggregation pipeline
  const pipeline = [
    { $match: { status: 'public' } },
    {
      $addFields: {
        // Boost factor: 1 if user is followed, 0 otherwise
        isFollowed: {
          $cond: [
            { $in: ['$user', followingIds] },
            1,
            0
          ]
        }
      }
    },
    // Sort by isFollowed DESC (1 first), then trendingScore DESC
    { $sort: { isFollowed: -1, trendingScore: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.password': 0,
        'user.email': 0
      }
    }
  ];

  const videos = await Video.aggregate(pipeline);
  const total = await Video.countDocuments({ status: 'public' });

  return {
    videos,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}
