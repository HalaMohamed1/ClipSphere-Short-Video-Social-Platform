import express from 'express';
import { VideoController } from '../controllers/videoController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import {
  loadVideo,
  assertVideoOwner,
  assertVideoOwnerOrAdminDelete,
} from '../middleware/ownership.js';

const router = express.Router();

router.post('/', protect, VideoController.createVideo);
router.get('/', VideoController.getPublicVideos);
router.get('/:id', VideoController.getVideoById);

router.patch(
  '/:id',
  protect,
  loadVideo,
  assertVideoOwner,
  VideoController.updateVideo
);

router.delete(
  '/:id',
  protect,
  loadVideo,
  assertVideoOwnerOrAdminDelete,
  VideoController.deleteVideo
);

router.post('/:videoId/reviews', protect, ReviewController.createReview);
router.get('/:videoId/reviews', ReviewController.getVideoReviews);
router.get('/:videoId/reviews/me', protect, ReviewController.getUserVideoReview);
router.patch('/reviews/:id', protect, ReviewController.updateReview);
router.delete('/reviews/:id', protect, ReviewController.deleteReview);

export default router;
