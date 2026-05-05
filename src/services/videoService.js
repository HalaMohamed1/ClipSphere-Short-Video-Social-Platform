import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Video } from '../db_core/models/Video.js';
import { Follower } from '../db_core/models/Follower.js';
import { AppError } from '../utils/appError.js';
import {
  putObject,
  deleteObject,
  getVideoBucket,
  getThumbnailBucket,
} from './storageService.js';
import { probeVideoDurationSeconds } from '../utils/videoProbe.js';
import { extractVideoThumbnailJpeg, safeUnlink } from '../utils/videoThumbnail.js';
import { cleanupTemp } from '../middleware/uploadVideo.js';

function getVideosMediaBasePath() {
  const base = (process.env.SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');
  return `${base}/api/v1/videos`;
}

/** API URLs so the browser never talks to MinIO directly (server streams from S3). */
export function attachMediaUrls(videoDoc) {
  const v = videoDoc?.toObject ? videoDoc.toObject() : { ...videoDoc };
  const id = v._id?.toString?.() ?? String(v._id);
  const basePath = getVideosMediaBasePath();

  if (v.videoKey) {
    v.videoUrl = `${basePath}/${id}/stream`;
  }
  if (v.thumbnailKey) {
    v.thumbnailUrl = `${basePath}/${id}/thumbnail`;
  }
  return v;
}

export function attachMediaUrlsMany(docs) {
  return docs.map((d) => attachMediaUrls(d));
}

/** Who may read streamed media (public, or owner/admin for private; admin for flagged). */
export function canAccessVideoMedia(req, video) {
  if (!video) return false;
  if (video.status === 'flagged') {
    return req.user?.role === 'admin';
  }
  if (video.status === 'public') return true;
  if (video.status === 'private') {
    if (!req.user) return false;
    const uid = req.user._id.toString();
    const ownerId = video.user?._id?.toString?.() ?? video.user?.toString?.() ?? '';
    return uid === ownerId || req.user.role === 'admin';
  }
  return false;
}

export class VideoService {
  /**
   * Multipart upload: probe duration, push to MinIO, then persist Mongo (Phase 2).
   */
  static async createVideoFromUpload({ userId, file, body }) {
    if (!file?.path) {
      throw new AppError('Video file is required', 400);
    }

    let durationSec;
    try {
      durationSec = await probeVideoDurationSeconds(file.path);
    } catch (e) {
      cleanupTemp(file.path);
      throw new AppError('Could not read video file (ffprobe failed). Is ffmpeg installed?', 400);
    }

    if (durationSec > 300) {
      cleanupTemp(file.path);
      throw new AppError('Video duration cannot exceed 300 seconds (5 minutes)', 400);
    }

    const title = (body.title || file.originalname || 'Untitled').slice(0, 100);
    const description = body.description || '';
    const category = body.category || 'others';

    const ext = path.extname(file.originalname) || '.mp4';
    const videoKey = `videos/${userId}/${randomUUID()}${ext}`;
    const bucket = getVideoBucket();

    try {
      const buf = fs.readFileSync(file.path);
      await putObject({
        bucket,
        key: videoKey,
        body: buf,
        contentType: file.mimetype || 'video/mp4',
      });
    } catch (e) {
      console.error('MinIO upload failed:', e);
      cleanupTemp(file.path);
      throw new AppError('Object storage upload failed', 500);
    }

    let thumbnailKey = null;
    let thumbTmp = null;
    try {
      thumbTmp = await extractVideoThumbnailJpeg(file.path, durationSec);
      const thumbBuf = fs.readFileSync(thumbTmp);
      thumbnailKey = `thumbnails/${userId}/${randomUUID()}.jpg`;
      await putObject({
        bucket: getThumbnailBucket(),
        key: thumbnailKey,
        body: thumbBuf,
        contentType: 'image/jpeg',
      });
    } catch (e) {
      console.warn('Thumbnail generation skipped:', e?.message || e);
    } finally {
      if (thumbTmp) safeUnlink(thumbTmp);
    }

    cleanupTemp(file.path);

    const video = await Video.create({
      title,
      description,
      category,
      duration: Math.max(1, Math.ceil(durationSec)),
      user: userId,
      videoKey,
      thumbnailKey,
      videoUrl: null,
      status: 'public',
    });

    return attachMediaUrls(await video.populate('user', 'username avatarKey bio role'));
  }

  static async createVideo(videoData) {
    if (videoData.duration > 300) {
      throw new AppError('Video duration cannot exceed 300 seconds (5 minutes)', 400);
    }

    const video = await Video.create(videoData);
    return attachMediaUrls(await video.populate('user', 'username avatarKey bio role'));
  }

  static async getPublicVideos(filters = {}) {
    const query = { status: 'public' };

    if (filters.category) {
      query.category = filters.category;
    }

    const search =
      typeof filters.search === 'string' && filters.search.trim()
        ? filters.search.trim()
        : '';
    if (search) {
      query.$text = { $search: search };
    }

    const limit = Math.min(parseInt(filters.limit, 10) || 20, 100);
    const page = Math.max(parseInt(filters.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const feed = filters.feed || 'discover';

    if (feed === 'trending') {
      return VideoService._getTrendingFeed({ query, skip, limit, page });
    }

    const videos = await Video.find(query)
      .populate('user', 'username avatarKey bio role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);
    const withUrls = attachMediaUrlsMany(videos);

    return {
      videos: withUrls,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async _getTrendingFeed({ query, skip, limit, page }) {
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'video',
          as: 'rev',
        },
      },
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$rev', []] } }, 0] },
              {
                $avg: {
                  $map: { input: '$rev', as: 'r', in: '$$r.rating' },
                },
              },
              0,
            ],
          },
          reviewCount: { $size: { $ifNull: ['$rev', []] } },
        },
      },
      {
        $addFields: {
          trendScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$avgRating', 0] }, 4] },
              { $multiply: [{ $ifNull: ['$likesCount', 0] }, 0.1] },
              { $multiply: [{ $ifNull: ['$views', 0] }, 0.01] },
            ],
          },
        },
      },
      { $sort: { trendScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const count = await Video.countDocuments(query);
    const raw = await Video.aggregate(pipeline);
    const ids = raw.map((d) => d._id);
    const populated = await Video.find({ _id: { $in: ids } })
      .populate('user', 'username avatarKey bio role')
      .lean();

    const order = new Map(ids.map((id, i) => [id.toString(), i]));
    populated.sort((a, b) => order.get(a._id.toString()) - order.get(b._id.toString()));

    const withUrls = attachMediaUrlsMany(populated);

    return {
      videos: withUrls,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit) || 1,
      },
    };
  }

  static async getFollowingFeed(userId, filters = {}) {
    const rel = await Follower.find({ follower: userId }).select('following').lean();
    const followingIds = rel.map((r) => r.following);

    if (followingIds.length === 0) {
      return {
        videos: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      };
    }

    const limit = Math.min(parseInt(filters.limit, 10) || 20, 100);
    const page = Math.max(parseInt(filters.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const query = {
      status: 'public',
      user: { $in: followingIds },
    };

    const fSearch =
      typeof filters.search === 'string' && filters.search.trim()
        ? filters.search.trim()
        : '';
    if (fSearch) {
      query.$text = { $search: fSearch };
    }

    const videos = await Video.find(query)
      .populate('user', 'username avatarKey bio role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);
    const withUrls = attachMediaUrlsMany(videos);

    return {
      videos: withUrls,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getVideoById(videoId) {
    const video = await Video.findById(videoId)
      .populate('user', 'username avatarKey bio role')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        populate: { path: 'user', select: 'username avatarKey' },
      });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    return attachMediaUrls(video);
  }

  static async updateVideo(videoId, updateData) {
    if (updateData.duration) {
      throw new AppError('Video duration cannot be updated', 400);
    }

    const video = await Video.findByIdAndUpdate(videoId, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', 'username avatarKey bio role');

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    return attachMediaUrls(video);
  }

  static async deleteVideo(videoId) {
    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    if (video.videoKey) {
      await deleteObject({ bucket: getVideoBucket(), key: video.videoKey }).catch(() => {});
    }
    if (video.thumbnailKey) {
      await deleteObject({ bucket: getThumbnailBucket(), key: video.thumbnailKey }).catch(
        () => {}
      );
    }

    return video;
  }

  static async incrementViews(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

    return video;
  }

  static async incrementLikes(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    return video;
  }

  static async decrementLikes(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    return video;
  }
}
