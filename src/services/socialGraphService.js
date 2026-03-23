import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Follower } from '../models/Follower.js';
import { AppError } from '../utils/appError.js';
import { resolveNotificationChannels } from '../utils/notificationEligibility.js';

const PUBLIC_USER_FIELDS = 'username avatarKey bio role createdAt';

export class SocialGraphService {
  static async follow(followerId, targetUserId) {
    if (followerId.toString() === targetUserId.toString()) {
      throw new AppError('You cannot follow yourself', 400);
    }

    const target = await User.findById(targetUserId);
    if (!target) {
      throw new AppError('User not found', 404);
    }

    try {
      const relationship = await Follower.create({
        follower: followerId,
        following: targetUserId,
      });

      const notificationDecision = resolveNotificationChannels(target, 'followers');

      return { relationship, notificationDecision };
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError('You are already following this user', 400);
      }
      if (err.message === 'You cannot follow yourself.') {
        throw new AppError('You cannot follow yourself', 400);
      }
      throw err;
    }
  }

  static async unfollow(followerId, targetUserId) {
    const deleted = await Follower.findOneAndDelete({
      follower: followerId,
      following: targetUserId,
    });

    if (!deleted) {
      throw new AppError('You are not following this user', 404);
    }

    return deleted;
  }

  static async getFollowers(userId, { page = 1, limit = 20 } = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user id', 400);
    }

    const exists = await User.exists({ _id: userId });
    if (!exists) {
      throw new AppError('User not found', 404);
    }

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      Follower.find({ following: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('follower', PUBLIC_USER_FIELDS),
      Follower.countDocuments({ following: userId }),
    ]);

    const users = rows.map((r) => r.follower).filter(Boolean);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user id', 400);
    }

    const exists = await User.exists({ _id: userId });
    if (!exists) {
      throw new AppError('User not found', 404);
    }

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      Follower.find({ follower: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('following', PUBLIC_USER_FIELDS),
      Follower.countDocuments({ follower: userId }),
    ]);

    const users = rows.map((r) => r.following).filter(Boolean);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
