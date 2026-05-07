import { Video } from '../db_core/models/Video.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const loadVideo = catchAsync(async (req, res, next) => {
  const video = await Video.findById(req.params.id).populate('user', 'username avatarKey bio');

  if (!video) {
    return next(new AppError('Video not found', 404));
  }

  req.video = video;
  next();
});

function getVideoOwnerId(req) {
  return req.video.user._id ? req.video.user._id : req.video.user;
}

function isVideoOwner(req) {
  return getVideoOwnerId(req).toString() === req.user._id.toString();
}

export const assertVideoOwner = (req, res, next) => {
  if (!isVideoOwner(req)) {
    return next(new AppError('You are not authorized to update this video', 403));
  }
  next();
};

export const assertVideoOwnerOrAdmin = (req, res, next) => {
  if (!isVideoOwner(req) && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this video', 403));
  }
  next();
};
