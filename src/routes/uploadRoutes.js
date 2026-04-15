import express from 'express';
import { protect } from '../middleware/auth.js';
import { UploadController } from '../controllers/uploadController.js';
import { uploadVideoMiddleware, uploadThumbnailMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/presign', protect, UploadController.presign);
router.post('/video', protect, uploadVideoMiddleware, UploadController.uploadVideo);
router.post('/thumbnail', protect, uploadThumbnailMiddleware, UploadController.uploadThumbnail);

export default router;
