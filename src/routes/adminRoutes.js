import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All admin routes are protected and restricted to admins
router.use(protect, restrictTo('admin'));

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
 *                     mostActiveUsers:
 *                       type: array
 *                     totalTips:
 *                       type: number
 *       403:
 *         description: Admin access required
 */
router.get('/stats', AdminController.getStats);

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
router.patch('/users/:id/status', AdminController.updateUserStatus);

/**
 * @swagger
 * /api/v1/admin/moderation:
 *   get:
 *     summary: Get moderation queue (flagged/suspended users)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: flagged
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
router.get('/moderation', AdminController.getModerationQueue);

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
 *                     timestamp:
 *                       type: string
 *       403:
 *         description: Admin access required
 */
router.get('/health', AdminController.getHealth);

export default router;
