import { User } from '../db_core/models/User.js';
import { Video } from '../db_core/models/Video.js';
import { AppError } from '../utils/appError.js';
import { attachMediaUrlsMany } from './videoService.js';

export class AdminService {
  static async getStats() {
    try {
      const [userStats, totalVideos, publicVideos, flaggedVideosCount] = await Promise.all([
        User.aggregate([
          {
            $facet: {
              total: [{ $count: 'count' }],
              active: [{ $match: { active: true } }, { $count: 'count' }],
              byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
            },
          },
        ]),
        Video.countDocuments(),
        Video.countDocuments({ status: 'public' }),
        Video.countDocuments({ status: 'flagged' }),
      ]);

      const mostActiveUsers = await User.find()
        .select('username email createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        totalUsers: userStats[0].total[0]?.count || 0,
        activeUsers: userStats[0].active[0]?.count || 0,
        usersByRole: userStats[0].byRole,
        totalVideos,
        publicVideos,
        flaggedVideosCount,
        mostActiveUsers,
        totalTips: 0,
      };
    } catch (error) {
      throw new AppError('Failed to fetch statistics', 500);
    }
  }

  static async updateUserStatus(userId, statusData) {
    const { status, active } = statusData;

    const updateFields = {};
    if (status) {
      updateFields.accountStatus = status;
    }
    if (active !== undefined) {
      updateFields.active = active;
    }

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async getModerationQueue(filters = {}) {
    const { limit = 20, skip = 0 } = filters;

    try {
      const [flaggedUsers, totalFlaggedUsers, flaggedVideos, totalFlaggedVideos] =
        await Promise.all([
          User.find({
            $or: [
              { accountStatus: 'flagged' },
              { accountStatus: 'suspended' },
              { active: false },
            ],
          })
            .select('-password')
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip(skip),
          User.countDocuments({
            $or: [
              { accountStatus: 'flagged' },
              { accountStatus: 'suspended' },
              { active: false },
            ],
          }),
          Video.find({ status: 'flagged' })
            .populate('user', 'username avatarKey accountStatus')
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip(skip),
          Video.countDocuments({ status: 'flagged' }),
        ]);

      return {
        flaggedVideos: attachMediaUrlsMany(flaggedVideos),
        totalFlaggedVideos,
        flaggedUsers,
        totalFlaggedUsers,
        limit,
        skip,
      };
    } catch (error) {
      throw new AppError('Failed to fetch moderation queue', 500);
    }
  }

  static async batchUpdateUsers(userIds, updateData) {
    try {
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        updateData,
        { runValidators: true }
      );

      return {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      };
    } catch (error) {
      throw new AppError('Batch update failed', 500);
    }
  }
}
