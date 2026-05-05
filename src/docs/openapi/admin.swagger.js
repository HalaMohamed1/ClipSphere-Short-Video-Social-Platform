/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for platform management
 */

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *                     usersByRole:
 *                       type: array
 *                     totalVideos:
 *                       type: number
 *                     publicVideos:
 *                       type: number
 *                     flaggedVideosCount:
 *                       type: number
 *                     mostActiveUsers:
 *                       type: array
 *                     totalTips:
 *                       type: number
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     summary: Update user account status (soft delete / deactivate)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, flagged]
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/admin/moderation:
 *   get:
 *     summary: Moderation queue (flagged videos and flagged or inactive users)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: Moderation queue retrieved
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/admin/health:
 *   get:
 *     summary: Get system health information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: string
 *                     memoryUsage:
 *                       type: object
 *                     systemMemory:
 *                       type: object
 *                     database:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                         readyState:
 *                           type: integer
 *                         state:
 *                           type: string
 *                         name:
 *                           type: string
 *                           nullable: true
 *                         host:
 *                           type: string
 *                           nullable: true
 *                     timestamp:
 *                       type: string
 *       403:
 *         description: Admin access required
 */

export {};
