import { Like } from '../db_core/models/Like.js';
import { Video } from '../db_core/models/Video.js';
import { User } from '../db_core/models/User.js';
import { AppError } from '../utils/appError.js';
import { VideoService } from './videoService.js';
import { sendEngagementNotification } from '../utils/engagementNotificationUtil.js';

export class LikeService {
  // Like a video
  static async likeVideo(userId, videoId) {
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, video: videoId });
    if (existingLike) {
      throw new AppError('Video already liked by this user', 400);
    }

    // Create the like
    const like = await Like.create({ user: userId, video: videoId });

    // Increment the video's likesCount
    await VideoService.incrementLikes(videoId);

    // Send engagement notification to video owner
    if (video.user && video.user.toString() !== userId.toString()) {
      const liker = await User.findById(userId).select('username');
      await sendEngagementNotification(
        video.user,
        'like',
        liker?.username || 'Someone',
        video.title
      );
    }

    return like.populate('user', 'username avatarKey');
  }

  // Unlike a video
  static async unlikeVideo(userId, videoId) {
    // Check if like exists
    const like = await Like.findOne({ user: userId, video: videoId });
    if (!like) {
      throw new AppError('Like not found', 404);
    }

    // Delete the like
    await Like.deleteOne({ _id: like._id });

    // Decrement the video's likesCount
    await VideoService.decrementLikes(videoId);

    return { message: 'Like removed successfully' };
  }

  // Check if user liked a video
  static async isVideoLiked(userId, videoId) {
    const like = await Like.findOne({ user: userId, video: videoId });
    return !!like;
  }

  // Get all likes for a video
  static async getVideoLikes(videoId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const likes = await Like.find({ video: videoId })
      .populate('user', 'username avatarKey bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Like.countDocuments({ video: videoId });

    return {
      likes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get all videos liked by a user
  static async getUserLikedVideos(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const likes = await Like.find({ user: userId })
      .populate({
        path: 'video',
        select: 'title description videoUrl thumbnailUrl user views likesCount createdAt',
        populate: { path: 'user', select: 'username avatarKey' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Like.countDocuments({ user: userId });

    return {
      videos: likes.map(like => like.video),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
