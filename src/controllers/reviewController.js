import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { ReviewService } from '../services/reviewService.js';
import { VideoService } from '../services/videoService.js';
import { createReviewSchema, updateReviewSchema } from '../validators/reviewValidator.js';
import { emitNewCommentEvent } from '../utils/engagementEmitter.js';
import { io } from '../index.js';

export class ReviewController {
  static createReview = catchAsync(async (req, res) => {
    const validatedData = createReviewSchema.parse(req.body);

    const reviewData = {
      ...validatedData,
      user: req.user._id,
      video: req.params.videoId,
    };

    const review = await ReviewService.createReview(reviewData);

    // Emit socket event to video owner
    try {
      const video = await VideoService.getVideoById(req.params.videoId);
      if (video && video.user) {
        const videoOwnerId = video.user._id;
        emitNewCommentEvent(
          io,
          videoOwnerId,
          req.user._id,
          req.user.username,
          req.params.videoId,
          video.title,
          validatedData.comment || ''
        );
      }
    } catch (error) {
      console.error('Error emitting comment event:', error.message);
      // Don't fail the request if socket emission fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: { review },
    });
  });

  static getVideoReviews = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ReviewService.getVideoReviews(req.params.videoId, {
      page,
      limit,
    });

    res.status(200).json({
      status: 'success',
      message: 'Reviews retrieved successfully',
      data: result,
    });
  });

  static getReviewById = catchAsync(async (req, res) => {
    const review = await ReviewService.getReviewById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  });

  static updateReview = catchAsync(async (req, res) => {
    const { id } = req.params;

    const review = await ReviewService.getReviewById(id);

    if (review.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this review',
      });
    }

    const validatedData = updateReviewSchema.parse(req.body);

    const updatedReview = await ReviewService.updateReview(id, validatedData);

    res.status(200).json({
      status: 'success',
      message: 'Review updated successfully',
      data: { review: updatedReview },
    });
  });

  static deleteReview = catchAsync(async (req, res) => {
    const { id } = req.params;

    const review = await ReviewService.getReviewById(id);

    if (review.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this review',
      });
    }

    await ReviewService.deleteReview(id);

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully',
    });
  });

  static getUserVideoReview = catchAsync(async (req, res) => {
    const review = await ReviewService.getUserVideoReview(
      req.user._id,
      req.params.videoId
    );

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  });
}
