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

/**
 * @swagger
 * /api/v1/videos/feed/trending:
 *   get:
 *     summary: Get trending videos (sorted by views, rating, and recency)
 *     description: Returns all public videos sorted by engagement metrics. No authentication required.
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of videos per page (default 20)
 *     responses:
 *       200:
 *         description: Trending videos with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           views:
 *                             type: number
 *                           likesCount:
 *                             type: number
 *                           averageRating:
 *                             type: number
 *                           user:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                               avatarKey:
 *                                 type: string
 *                     totalCount:
 *                       type: number
 *                       description: Total number of videos available
 *                     page:
 *                       type: number
 *                       description: Current page number
 *                     pageSize:
 *                       type: number
 *                       description: Number of videos per page
 *                     hasMore:
 *                       type: boolean
 *                       description: Whether more videos are available
 */

/**
 * @swagger
 * /api/v1/videos/feed/following:
 *   get:
 *     summary: Get following feed (videos from users you follow)
 *     description: Returns videos only from users that the authenticated user follows.
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of videos per page (default 20)
 *     responses:
 *       200:
 *         description: Following feed with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalCount:
 *                       type: number
 *                       description: Total number of videos available
 *                     page:
 *                       type: number
 *                       description: Current page number
 *                     pageSize:
 *                       type: number
 *                       description: Number of videos per page
 *                     hasMore:
 *                       type: boolean
 *                       description: Whether more videos are available
 *       401:
 *         description: Unauthorized - JWT token required
 */

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

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Video reviews
 */

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

export {};
