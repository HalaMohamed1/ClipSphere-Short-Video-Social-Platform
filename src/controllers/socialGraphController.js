import { catchAsync } from '../utils/catchAsync.js';
import { SocialGraphService } from '../services/socialGraphService.js';

export class SocialGraphController {
  static followUser = catchAsync(async (req, res) => {
    const targetId = req.params.id;

    const { relationship, notificationDecision } = await SocialGraphService.follow(
      req.user._id,
      targetId
    );

    res.status(201).json({
      status: 'success',
      message: 'You are now following this user',
      data: {
        follow: relationship,
        notificationDecision,
      },
    });
  });

  static unfollowUser = catchAsync(async (req, res) => {
    const targetId = req.params.id;

    await SocialGraphService.unfollow(req.user._id, targetId);

    res.status(200).json({
      status: 'success',
      message: 'You have unfollowed this user',
    });
  });

  static getFollowers = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const result = await SocialGraphService.getFollowers(req.params.id, { page, limit });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  static getFollowing = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const result = await SocialGraphService.getFollowing(req.params.id, { page, limit });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });
}
