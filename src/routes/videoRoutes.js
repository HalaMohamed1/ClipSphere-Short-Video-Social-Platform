import express from 'express';
import { VideoController } from '../controllers/videoController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management endpoints
 */

/**
 * @swagger
 * /api/v1/videos:
 *   post:
 *     summary: Create a new video with metadata
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *               - videoUrl
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               duration:
 *                 type: number
 *                 description: Video duration in seconds (max 300)
 *               videoUrl:
 *                 type: string
 *                 format: url
 *               thumbnailUrl:
 *                 type: string
 *                 format: url
 *               category:
 *                 type: string
 *                 enum: [music, gaming, sports, tech, entertainment, educational]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Video created successfully
 *       400:
 *         description: Validation error or duration exceeds 5 minutes
 */
router.post('/', protect, VideoController.createVideo);

/**
 * @swagger
 * /api/v1/videos:
 *   get:
 *     summary: Get all public videos (feed)
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of public videos
 */
router.get('/', VideoController.getPublicVideos);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   get:
 *     summary: Get a video by ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video details
 *       404:
 *         description: Video not found
 */
router.get('/:id', VideoController.getVideoById);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   patch:
 *     summary: Update video (owner only)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [public, private, flagged]
 *               tags:
 *                 type: array
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Video not found
 */
router.patch('/:id', protect, VideoController.updateVideo);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   delete:
 *     summary: Delete video (owner or admin)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Video not found
 */
router.delete('/:id', protect, VideoController.deleteVideo);

/**
 * @swagger
 * /api/v1/videos/{videoId}/reviews:
 *   post:
 *     summary: Submit a 1-5 star review (one per user per video)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: User already reviewed this video or validation error
 *       404:
 *         description: Video not found
 */
router.post('/:videoId/reviews', protect, ReviewController.createReview);

/**
 * @swagger
 * /api/v1/videos/{videoId}/reviews:
 *   get:
 *     summary: Get all reviews for a video
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews with stats
 */
router.get('/:videoId/reviews', ReviewController.getVideoReviews);

/**
 * @swagger
 * /api/v1/videos/{videoId}/reviews/me:
 *   get:
 *     summary: Get current user's review for a video
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's review or null if not reviewed
 */
router.get('/:videoId/reviews/me', protect, ReviewController.getUserVideoReview);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   patch:
 *     summary: Update a review (reviewer only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */
router.patch('/reviews/:id', protect, ReviewController.updateReview);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review (reviewer or admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */
router.delete('/reviews/:id', protect, ReviewController.deleteReview);

export default router;
