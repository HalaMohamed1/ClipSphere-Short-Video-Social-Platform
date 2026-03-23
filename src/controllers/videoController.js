import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { VideoService } from '../services/videoService.js';
import { createVideoSchema, updateVideoSchema } from '../validators/videoValidator.js';

export class VideoController {
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

    const result = await VideoService.getPublicVideos({
      page,
      limit,
      category,
      search,
    });

    res.status(200).json({
      status: 'success',
      message: 'Videos retrieved successfully',
      data: result,
    });
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

  // Delete video (owner or admin; enforced by assertVideoOwnerOrAdminDelete middleware)
  static deleteVideo = catchAsync(async (req, res) => {
    await VideoService.deleteVideo(req.video._id);

    res.status(200).json({
      status: 'success',
      message: 'Video deleted successfully',
    });
  });
}
