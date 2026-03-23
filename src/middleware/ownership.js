import { Video } from '../db_core/models/Video.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

/** Load video by :id and attach to req.video (404 if missing). */
export const loadVideo = catchAsync(async (req, res, next) => {
  const video = await Video.findById(req.params.id).populate('user', 'username avatarKey bio');

  if (!video) {
    return next(new AppError('Video not found', 404));
  }

  req.video = video;
  next();
});

/** PATCH: only the video owner may update (admins cannot override). */
export const assertVideoOwner = (req, res, next) => {
  const ownerId = req.video.user._id ? req.video.user._id : req.video.user;
  if (ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this video', 403));
  }
  next();
};

/** DELETE: owner or platform admin. */
export const assertVideoOwnerOrAdminDelete = (req, res, next) => {
  const ownerId = req.video.user._id ? req.video.user._id : req.video.user;
  const isOwner = ownerId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this video', 403));
  }
  next();
};
