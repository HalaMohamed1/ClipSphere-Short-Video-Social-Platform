import { Video } from '../db_core/models/Video.js';
import { Follower } from '../models/Follower.js';
import { AppError } from '../utils/appError.js';

export class VideoService {
  static async createVideo(videoData) {
    if (videoData.duration > 300) {
      throw new AppError('Video duration cannot exceed 300 seconds (5 minutes)', 400);
    }

    const video = await Video.create(videoData);
    return video.populate('user', 'username avatarKey bio');
  }

  static async getPublicVideos(filters = {}) {
    const query = { status: 'public' };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (filters.page - 1) * filters.limit || 0;

    const videos = await Video.find(query)
      .populate('user', 'username avatarKey bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filters.limit || 20);

    const total = await Video.countDocuments(query);

    return {
      videos,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        pages: Math.ceil(total / (filters.limit || 20)),
      },
    };
  }

  static async getVideoById(videoId) {
    const video = await Video.findById(videoId)
      .populate('user', 'username avatarKey bio')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        populate: { path: 'user', select: 'username avatarKey' },
      });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    return video;
  }

  static async updateVideo(videoId, updateData) {
    if (updateData.duration) {
      throw new AppError('Video duration cannot be updated', 400);
    }

    const video = await Video.findByIdAndUpdate(videoId, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', 'username avatarKey bio');

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    return video;
  }

  static async deleteVideo(videoId) {
    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    return video;
  }

  static async incrementViews(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

    return video;
  }

  static async incrementLikes(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    return video;
  }

  static async decrementLikes(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    return video;
  }

  static async getFollowingFeed(userId, filters = {}) {
    // Get list of users that this user follows
    const followingUsers = await Follower.find({ follower: userId })
      .select('following')
      .lean();

    const followingUserIds = followingUsers.map(f => f.following);

    const page = filters.page || 1;
    const pageSize = filters.limit || 20;
    const skip = (page - 1) * pageSize || 0;

    // If user doesn't follow anyone, return empty array
    if (followingUserIds.length === 0) {
      return {
        videos: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }

    // Query videos from followed users
    const query = {
      status: 'public',
      user: { $in: followingUserIds },
    };

    const videos = await Video.find(query)
      .populate('user', 'username avatarKey bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Video.countDocuments(query);
    const pages = Math.ceil(total / pageSize);

    return {
      videos,
      totalCount: total,
      page,
      pageSize,
      hasMore: page < pages,
    };
  }

  static async getTrendingFeed(filters = {}) {
    // Aggregation pipeline to get trending videos sorted by views and rating
    const page = filters.page || 1;
    const pageSize = filters.limit || 20;
    const skip = (page - 1) * pageSize || 0;

    const videos = await Video.aggregate([
      // Match only public videos
      {
        $match: { status: 'public' },
      },
      // Lookup reviews to calculate average rating
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'video',
          as: 'reviews',
        },
      },
      // Add average rating field
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.rating' },
              0,
            ],
          },
          reviewCount: { $size: '$reviews' },
        },
      },
      // Sort by views (DESC), then averageRating (DESC), then createdAt (DESC)
      {
        $sort: { views: -1, averageRating: -1, createdAt: -1 },
      },
      // Lookup user info
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      // Unwind user array to single object
      {
        $unwind: '$user',
      },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          videoUrl: 1,
          thumbnailUrl: 1,
          category: 1,
          duration: 1,
          status: 1,
          views: 1,
          likesCount: 1,
          averageRating: 1,
          reviewCount: 1,
          createdAt: 1,
          updatedAt: 1,
          'user._id': 1,
          'user.username': 1,
          'user.avatarKey': 1,
          'user.bio': 1,
        },
      },
      // Skip and limit for pagination
      { $skip: skip },
      { $limit: pageSize },
    ]);

    // Get total count
    const totalCount = await Video.countDocuments({ status: 'public' });
    const pages = Math.ceil(totalCount / pageSize);

    return {
      videos,
      totalCount,
      page,
      pageSize,
      hasMore: page < pages,
    };
  }
}
