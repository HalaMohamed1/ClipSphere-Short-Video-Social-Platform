import mongoose from 'mongoose';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { Video } from '../db_core/models/Video.js';
import { VideoService, canAccessVideoMedia } from '../services/videoService.js';
import { getObjectFromBucket, getVideoBucket, getThumbnailBucket } from '../services/storageService.js';
import { createVideoSchema, updateVideoSchema } from '../validators/videoValidator.js';

export class VideoController {
  /** Multipart upload: video file + title/description (MinIO + ffprobe). */
  static uploadVideo = catchAsync(async (req, res) => {
    if (!req.file) {
      throw new AppError('Video file is required (field name: video)', 400);
    }

    const video = await VideoService.createVideoFromUpload({
      userId: req.user._id,
      file: req.file,
      body: req.body,
    });

    res.status(201).json({
      status: 'success',
      message: 'Video uploaded successfully',
      data: { video },
    });
  });

  // Create a new video
  static createVideo = catchAsync(async (req, res) => {
    // Validate input with Zod
    const validatedData = createVideoSchema.parse(req.body);

    // Add user ID
    const videoData = {
      ...validatedData,
      user: req.user._id,
    };

    const video = await VideoService.createVideo(videoData);

    res.status(201).json({
      status: 'success',
      message: 'Video created successfully',
      data: { video },
    });
  });

  // Get all public videos (feed)
  static getPublicVideos = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;
    const feed = req.query.feed;

    const result = await VideoService.getPublicVideos({
      page,
      limit,
      category,
      search,
      feed,
    });

    res.status(200).json({
      status: 'success',
      message: 'Videos retrieved successfully',
      data: result,
    });
  });

  /** Videos from users the current user follows (Phase 2). */
  static getFollowingFeed = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;

    const result = await VideoService.getFollowingFeed(req.user._id, {
      page,
      limit,
      search,
    });

    res.status(200).json({
      status: 'success',
      message: 'Following feed retrieved successfully',
      data: result,
    });
  });

  /** Stream video from MinIO via API (browser never hits MinIO). Supports Range for seeking. */
  static streamVideo = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid video id', 400);
    }

    const video = await Video.findById(id).select('user status videoKey videoUrl').lean();
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    if (!canAccessVideoMedia(req, video)) {
      throw new AppError('You do not have permission to view this video', 403);
    }

    if (!video.videoKey) {
      if (video.videoUrl && /^https?:\/\//i.test(video.videoUrl)) {
        return res.redirect(302, video.videoUrl);
      }
      throw new AppError('Video file not available', 404);
    }

    const range = req.headers.range;
    let result;
    try {
      result = await getObjectFromBucket({
        bucket: getVideoBucket(),
        key: video.videoKey,
        range: range || undefined,
      });
    } catch (e) {
      if (e?.$metadata?.httpStatusCode === 416 || e?.name === 'InvalidRangeError') {
        throw new AppError('Invalid range', 416);
      }
      throw e;
    }

    if (!result?.body) {
      throw new AppError('Video file not found', 404);
    }

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', result.contentType || 'video/mp4');
    if (result.contentLength != null) {
      res.setHeader('Content-Length', String(result.contentLength));
    }
    if (result.contentRange) {
      res.status(206);
      res.setHeader('Content-Range', result.contentRange);
    } else {
      res.status(200);
    }

    result.body.pipe(res);
  });

  /** Thumbnail image from MinIO via API. */
  static serveThumbnail = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid video id', 400);
    }

    const video = await Video.findById(id).select('user status thumbnailKey thumbnailUrl').lean();
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    if (!canAccessVideoMedia(req, video)) {
      throw new AppError('You do not have permission to view this thumbnail', 403);
    }

    if (!video.thumbnailKey) {
      if (video.thumbnailUrl && /^https?:\/\//i.test(video.thumbnailUrl)) {
        return res.redirect(302, video.thumbnailUrl);
      }
      throw new AppError('Thumbnail not available', 404);
    }

    const result = await getObjectFromBucket({
      bucket: getThumbnailBucket(),
      key: video.thumbnailKey,
    });
    if (!result?.body) {
      throw new AppError('Thumbnail not found', 404);
    }

    res.setHeader('Content-Type', result.contentType || 'image/jpeg');
    if (result.contentLength != null) {
      res.setHeader('Content-Length', String(result.contentLength));
    }
    res.status(200);
    result.body.pipe(res);
  });

  // Get a single video by ID
  static getVideoById = catchAsync(async (req, res) => {
    const video = await VideoService.getVideoById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { video },
    });
  });

  // Update video (owner only; enforced by assertVideoOwner middleware)
  static updateVideo = catchAsync(async (req, res) => {
    const validatedData = updateVideoSchema.parse(req.body);

    const updatedVideo = await VideoService.updateVideo(req.video._id, validatedData);

    res.status(200).json({
      status: 'success',
      message: 'Video updated successfully',
      data: { video: updatedVideo },
    });
  });

  // Delete video (owner or admin; enforced by assertVideoOwnerOrAdmin middleware)
  static deleteVideo = catchAsync(async (req, res) => {
    await VideoService.deleteVideo(req.video._id);

    res.status(200).json({
      status: 'success',
      message: 'Video deleted successfully',
    });
  });
}
