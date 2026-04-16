import mongoose from 'mongoose';
import os from 'os';
import { catchAsync } from '../utils/catchAsync.js';
import { AdminService } from '../services/adminService.js';
import { updateAdminUserStatusSchema } from '../validators/adminValidator.js';

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
    const { status, active } = updateAdminUserStatusSchema.parse(req.body ?? {});

    const user = await AdminService.updateUserStatus(id, { status, active });

    res.status(200).json({
      status: 'success',
      message: 'User status updated successfully',
      data: { user },
    });
  });

  // Get moderation queue
  static getModerationQueue = catchAsync(async (req, res) => {
    const { limit = 20, skip = 0 } = req.query;

    const queue = await AdminService.getModerationQueue({
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
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

    const readyState = mongoose.connection.readyState;
    const dbLabels = ['disconnected', 'connected', 'connecting', 'disconnecting'];
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
        database: {
          connected: readyState === 1,
          readyState,
          state: dbLabels[readyState] ?? 'unknown',
          name: mongoose.connection.name || null,
          host: mongoose.connection.host || null,
        },
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Get combined statistics (for admin dashboard)
  static getStatistics = catchAsync(async (req, res) => {
    const stats = await AdminService.getStats();
    
    // Get system health metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    // Calculate memory percentage
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

    const readyState = mongoose.connection.readyState;
    const dbLabels = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const databaseStatus = dbLabels[readyState] ?? 'unknown';

    res.status(200).json({
      status: 'success',
      message: 'Complete statistics retrieved successfully',
      data: {
        totalUsers: stats.totalUsers,
        totalVideos: stats.totalVideos,
        systemHealth: {
          uptime: Math.floor(uptime),
          memoryUsage: memoryPercentage,
          databaseStatus,
        },
      },
    });
  });
}
