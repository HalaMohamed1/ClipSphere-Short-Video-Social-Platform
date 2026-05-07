import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { SocialGraphController } from '../controllers/socialGraphController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { followActionSchema } from '../validators/phase3Validator.js';
import { AppError } from '../utils/appError.js';

const blockSelfFollow = (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot follow yourself', 400));
  }
  next();
};

const router = express.Router();

router.get('/me', protect, AuthController.getMe);
router.patch('/updateMe', protect, AuthController.updateMe);
router.patch('/preferences', protect, AuthController.updatePreferences);

// Follow/Unfollow routes with Zod validation
router.post('/:id/follow', protect, blockSelfFollow, validateRequest(followActionSchema, 'params'), SocialGraphController.followUser);
router.delete('/:id/unfollow', protect, validateRequest(followActionSchema, 'params'), SocialGraphController.unfollowUser);
router.get('/:id/followers', SocialGraphController.getFollowers);
router.get('/:id/following', SocialGraphController.getFollowing);

// Get user by username (must come BEFORE /:id route)
router.get('/username/:username', AuthController.getUserProfileByUsername);

router.get('/:id', AuthController.getUserProfile);

export default router;
