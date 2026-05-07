import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { LikeService } from '../services/likeService.js';
import { emitNewLike, emitUnlike } from '../io/socketManager.js';
import { Video } from '../db_core/models/Video.js';
import { User } from '../db_core/models/User.js';
import { likesPaginationSchema } from '../validators/likeValidator.js';

export class LikeController {
  static likeVideo = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    const like = await LikeService.likeVideo(userId, videoId);

    const video = await Video.findById(videoId).populate('user', '_id');
    const liker = await User.findById(userId).select('username');

    if (video && video.user) {
      emitNewLike(video.user._id, {
        likerId: userId,
        liker: liker?.username || 'Anonymous',
        videoId: videoId,
        videoTitle: video.title,
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Video liked successfully',
      data: { like },
    });
  });

  static unlikeVideo = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    const result = await LikeService.unlikeVideo(userId, videoId);

    const video = await Video.findById(videoId).populate('user', '_id');
    const liker = await User.findById(userId).select('username');

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

  static isVideoLiked = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    const isLiked = await LikeService.isVideoLiked(userId, videoId);

    res.status(200).json({
      status: 'success',
      data: { isLiked },
    });
  });

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
