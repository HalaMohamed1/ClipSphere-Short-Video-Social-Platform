import express from 'express';
import { VideoController } from '../controllers/videoController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { LikeController } from '../controllers/likeController.js';
import { EnhancedController } from '../controllers/enhancedController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { loadVideo, assertVideoOwner, assertVideoOwnerOrAdmin } from '../middleware/ownership.js';
import { uploadVideoFile } from '../middleware/uploadVideo.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Place specific routes BEFORE generic /:id routes to avoid path conflicts
router.post(
  '/upload',
  protect,
  uploadLimiter,
  uploadVideoFile.single('video'),
  VideoController.uploadVideo
);
router.post('/', protect, VideoController.createVideo);

// Specific feed endpoints (must come before /:id)
router.get('/feed/following', protect, EnhancedController.getEnhancedFeed);
router.get('/user/liked-videos', protect, LikeController.getUserLikedVideos);

// Generic /videos endpoint
router.get('/', VideoController.getPublicVideos);

// Media streaming endpoints
router.get('/:id/thumbnail', optionalAuth, VideoController.serveThumbnail);
router.get('/:id/stream', optionalAuth, VideoController.streamVideo);

// View count increment (must come before generic /:id)
router.patch('/:videoId/increment-views', LikeController.incrementViewCount);

// Video CRUD endpoints
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
  assertVideoOwnerOrAdmin,
  VideoController.deleteVideo
);

// Review routes
router.post('/:videoId/reviews', protect, EnhancedController.createReview);
router.get('/:videoId/reviews', ReviewController.getVideoReviews);
router.get('/:videoId/reviews/me', protect, ReviewController.getUserVideoReview);
router.patch('/reviews/:id', protect, ReviewController.updateReview);
router.delete('/reviews/:id', protect, ReviewController.deleteReview);

// Like routes
router.post('/:videoId/like', protect, LikeController.likeVideo);
router.delete('/:videoId/like', protect, LikeController.unlikeVideo);
router.get('/:videoId/like/check', protect, LikeController.isVideoLiked);
router.get('/:videoId/likes', LikeController.getVideoLikes);

export default router;
