import express from 'express';
import { VideoController } from '../controllers/videoController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { LikeController } from '../controllers/likeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { loadVideo, assertVideoOwner, assertVideoOwnerOrAdmin } from '../middleware/ownership.js';
import { uploadVideoFile } from '../middleware/uploadVideo.js';

const router = express.Router();

router.post(
  '/upload',
  protect,
  uploadVideoFile.single('video'),
  VideoController.uploadVideo
);
router.post('/', protect, VideoController.createVideo);
router.get('/feed/following', protect, VideoController.getFollowingFeed);
router.get('/', VideoController.getPublicVideos);
router.get('/user/liked-videos', protect, LikeController.getUserLikedVideos);

router.get('/:id/thumbnail', optionalAuth, VideoController.serveThumbnail);
router.get('/:id/stream', optionalAuth, VideoController.streamVideo);

router.get('/:id', VideoController.getVideoById);

// Before PATCH /:id so paths like /:videoId/increment-views are not ambiguous
router.patch('/:videoId/increment-views', LikeController.incrementViewCount);

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

router.post('/:videoId/reviews', protect, ReviewController.createReview);
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
