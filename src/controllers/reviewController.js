import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { ReviewService } from '../services/reviewService.js';
import { createReviewSchema, updateReviewSchema } from '../validators/reviewValidator.js';
import { paginationSchema } from '../validators/commonValidator.js';
import { emitNewReview } from '../io/socketManager.js';
import { Video } from '../db_core/models/Video.js';
import { User } from '../db_core/models/User.js';

export class ReviewController {
  static createReview = catchAsync(async (req, res) => {
    const validatedData = createReviewSchema.parse(req.body);

    const reviewData = {
      ...validatedData,
      user: req.user._id,
      video: req.params.videoId,
    };

    const review = await ReviewService.createReview(reviewData);

    // Emit socket event for new review
    const video = await Video.findById(req.params.videoId).populate('user', '_id');
    const reviewer = await User.findById(req.user._id).select('username');

    if (video && video.user) {
      emitNewReview(video.user._id, {
        reviewerId: req.user._id,
        reviewerUsername: reviewer?.username || 'Anonymous',
        rating: validatedData.rating,
        comment: validatedData.comment,
        videoId: req.params.videoId,
        videoTitle: video.title,
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: { review },
    });
  });

  static getVideoReviews = catchAsync(async (req, res) => {
    const validatedQuery = paginationSchema.parse(req.query);

    const result = await ReviewService.getVideoReviews(req.params.videoId, validatedQuery);

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
      throw new AppError('You are not authorized to update this review', 403);
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
      throw new AppError('You are not authorized to delete this review', 403);
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
