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

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to follow
 *     responses:
 *       201:
 *         description: Now following
 *       400:
 *         description: Already following or self-follow
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
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
 *         description: Unfollowed
 *       404:
 *         description: Not following this user
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     summary: List users following this account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Followers list
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/{id}/following:
 *   get:
 *     summary: List accounts this user follows
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Following list
 *       404:
 *         description: User not found
 */

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

export {};
