/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File uploads (multipart and presigned URLs)
 */

/**
 * @swagger
 * /api/v1/upload/presign:
 *   post:
 *     summary: Get a presigned PUT URL for direct upload to object storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentType
 *             properties:
 *               contentType:
 *                 type: string
 *                 example: video/mp4
 *               filename:
 *                 type: string
 *                 example: clip.mp4
 *               kind:
 *                 type: string
 *                 enum: [video, thumbnail]
 *                 default: video
 *     responses:
 *       200:
 *         description: Presigned URL and metadata
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/upload/video:
 *   post:
 *     summary: Upload a video file (multipart, server validates type and size)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Video stored; returns object key and public URL
 *       400:
 *         description: Invalid file type, size, or missing file
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/upload/thumbnail:
 *   post:
 *     summary: Upload a thumbnail image (multipart)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Thumbnail stored; returns object key and public URL
 *       400:
 *         description: Invalid file type, size, or missing file
 *       401:
 *         description: Not authenticated
 */
