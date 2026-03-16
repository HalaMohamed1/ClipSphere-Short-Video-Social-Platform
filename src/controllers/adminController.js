import { catchAsync } from '../utils/catchAsync.js';
import { AdminService } from '../services/adminService.js';
import { AppError } from '../utils/appError.js';
import os from 'os';

export class AdminController {
  // Get platform statistics
  static getStats = catchAsync(async (req, res) => {
    const stats = await AdminService.getStats();

    res.status(200).json({
      status: 'success',
      message: 'Platform statistics retrieved successfully',
      data: stats,
    });
  });

  // Update user account status (soft delete / deactivate)
  static updateUserStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, active } = req.body;

    // Validate status parameter
    if (status && !['active', 'suspended', 'flagged'].includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const user = await AdminService.updateUserStatus(id, { status, active });

    res.status(200).json({
      status: 'success',
      message: 'User status updated successfully',
      data: { user },
    });
  });

  // Get moderation queue
  static getModerationQueue = catchAsync(async (req, res) => {
    const { status = 'flagged', limit = 20, skip = 0 } = req.query;

    const queue = await AdminService.getModerationQueue({
      status,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });

    res.status(200).json({
      status: 'success',
      message: 'Moderation queue retrieved successfully',
      data: queue,
    });
  });

  // Get system health (uptime, memory, DB connection status)
  static getHealth = catchAsync(async (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    res.status(200).json({
      status: 'success',
      message: 'Server health check',
      data: {
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memoryUsage: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        },
        systemMemory: {
          total: `${Math.round(totalMemory / 1024 / 1024 / 1024)} GB`,
          free: `${Math.round(freeMemory / 1024 / 1024 / 1024)} GB`,
        },
        timestamp: new Date().toISOString(),
      },
    });
  });
}
