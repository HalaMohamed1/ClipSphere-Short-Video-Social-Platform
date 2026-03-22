import { Video } from '../db_core/models/Video.js';
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
}
