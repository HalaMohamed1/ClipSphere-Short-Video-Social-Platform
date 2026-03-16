import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';

export class AdminService {
  // Get platform statistics using aggregation pipeline
  static async getStats() {
    try {
      // Total users and active users
      const userStats = await User.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            active: [{ $match: { active: true } }, { $count: 'count' }],
            byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
          },
        },
      ]);

      // Most active users of the week (can be enhanced with activity tracking)
      const mostActiveUsers = await User.find()
        .select('username email createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        totalUsers: userStats[0].total[0]?.count || 0,
        activeUsers: userStats[0].active[0]?.count || 0,
        usersByRole: userStats[0].byRole,
        mostActiveUsers: mostActiveUsers,
        totalTips: 0, // Will be updated in Phase 3 with payment integration
      };
    } catch (error) {
      throw new AppError('Failed to fetch statistics', 500);
    }
  }

  // Update user account status (soft delete)
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

  // Get moderation queue (flagged/suspended users and flagged content)
  static async getModerationQueue(filters = {}) {
    const { status = 'flagged', limit = 20, skip = 0 } = filters;

    try {
      // Get flagged/suspended users
      const flaggedUsers = await User.find({
        $or: [
          { accountStatus: 'flagged' },
          { accountStatus: 'suspended' },
          { active: false },
        ],
      })
        .select('-password')
        .limit(limit)
        .skip(skip);

      const totalFlagged = await User.countDocuments({
        $or: [
          { accountStatus: 'flagged' },
          { accountStatus: 'suspended' },
          { active: false },
        ],
      });

      return {
        flaggedUsers,
        totalFlagged,
        limit,
        skip,
      };
    } catch (error) {
      throw new AppError('Failed to fetch moderation queue', 500);
    }
  }

  // Batch operations on users (future enhancement)
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
