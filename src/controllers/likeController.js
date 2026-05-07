import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { LikeService } from '../services/likeService.js';
import { VideoService } from '../services/videoService.js';
import { emitNewLikeEvent } from '../utils/engagementEmitter.js';
import { io } from '../index.js';
import { emitNewLike, emitUnlike } from '../io/socketManager.js';
import { Video } from '../db_core/models/Video.js';
import { User } from '../db_core/models/User.js';
import { likesPaginationSchema } from '../validators/likeValidator.js';

export class LikeController {
  // Like a video
  static likeVideo = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    const like = await LikeService.likeVideo(userId, videoId);

    // Emit socket event to video owner
    try {
      const video = await VideoService.getVideoById(videoId);
      if (video && video.user) {
        const videoOwnerId = video.user._id;
        emitNewLikeEvent(
          io,
          videoOwnerId,
          userId,
          req.user.username,
          videoId,
          video.title
        );
      }
    } catch (error) {
      console.error('Error emitting like event:', error.message);
      // Don't fail the request if socket emission fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Video liked successfully',
      data: { like },
    });
  });

  // Unlike a video
  static unlikeVideo = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    const result = await LikeService.unlikeVideo(userId, videoId);

    // Get video and liker details for socket event
    const video = await Video.findById(videoId).populate('user', '_id');
    const liker = await User.findById(userId).select('username');

    // Emit real-time unlike event to video owner
    if (video && video.user) {
      emitUnlike(video.user._id, {
        likerId: userId,
        liker: liker?.username || 'Anonymous',
        videoId: videoId,
        videoTitle: video.title,
      });
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  });

  // Check if video is liked by user
  static isVideoLiked = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    const isLiked = await LikeService.isVideoLiked(userId, videoId);

    res.status(200).json({
      status: 'success',
      data: { isLiked },
    });
  });

  // Get all likes for a video
  static getVideoLikes = catchAsync(async (req, res) => {
    const { videoId } = req.params;
    const validatedQuery = likesPaginationSchema.parse(req.query);

    const result = await LikeService.getVideoLikes(videoId, validatedQuery);

    res.status(200).json({
      status: 'success',
      message: 'Likes retrieved successfully',
      data: result,
    });
  });

  // Get all videos liked by user
  static getUserLikedVideos = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const validatedQuery = likesPaginationSchema.parse(req.query);

    const result = await LikeService.getUserLikedVideos(userId, validatedQuery);

    res.status(200).json({
      status: 'success',
      message: 'Liked videos retrieved successfully',
      data: result,
    });
  });

  // Increment view count for a video
  static incrementViewCount = catchAsync(async (req, res) => {
    const { videoId } = req.params;

    const videoService = (await import('../services/videoService.js')).VideoService;
    const video = await videoService.incrementViews(videoId);

    res.status(200).json({
      status: 'success',
      message: 'View count incremented',
      data: { video },
    });
  });
}
