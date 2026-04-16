import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { LikeService } from '../services/likeService.js';

export class LikeController {
  // Like a video
  static likeVideo = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    const like = await LikeService.likeVideo(userId, videoId);

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await LikeService.getVideoLikes(videoId, { page, limit });

    res.status(200).json({
      status: 'success',
      message: 'Likes retrieved successfully',
      data: result,
    });
  });

  // Get all videos liked by user
  static getUserLikedVideos = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await LikeService.getUserLikedVideos(userId, { page, limit });

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
