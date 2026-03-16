import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and account management
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data retrieved
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
 *                     user:
 *                       type: object
 *       401:
 *         description: Not authenticated
 */
router.get('/me', protect, AuthController.getMe);

/**
 * @swagger
 * /api/v1/users/updateMe:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               avatarKey:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Validation error
 */
router.patch('/updateMe', protect, AuthController.updateMe);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   patch:
 *     summary: Update notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationPreferences:
 *                 type: object
 *                 properties:
 *                   inApp:
 *                     type: object
 *                     properties:
 *                       followers:
 *                         type: boolean
 *                       comments:
 *                         type: boolean
 *                       likes:
 *                         type: boolean
 *                       tips:
 *                         type: boolean
 *                   email:
 *                     type: object
 *                     properties:
 *                       followers:
 *                         type: boolean
 *                       comments:
 *                         type: boolean
 *                       likes:
 *                         type: boolean
 *                       tips:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch('/preferences', protect, AuthController.updatePreferences);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       404:
 *         description: User not found
 */
router.get('/:id', AuthController.getUserProfile);

export default router;
