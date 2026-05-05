import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', AdminController.getStats);
router.get('/statistics', AdminController.getStatistics);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.get('/moderation', AdminController.getModerationQueue);
router.get('/health', AdminController.getHealth);

export default router;
