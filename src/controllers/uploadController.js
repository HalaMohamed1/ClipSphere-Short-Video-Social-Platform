import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import { presignSchema } from '../validators/uploadValidator.js';
import {
  buildObjectKey,
  getBucketForKind,
  getPresignedPutUrl,
  putObjectBuffer,
} from '../services/uploadService.js';

export class UploadController {
  static presign = catchAsync(async (req, res) => {
    const data = presignSchema.parse(req.body);
    const { kind, contentType, filename } = data;
    const bucket = getBucketForKind(kind);
    const key = buildObjectKey(req.user._id.toString(), filename, kind);
    const { uploadUrl, expiresIn } = await getPresignedPutUrl({ bucket, key, contentType });

    res.status(200).json({
      status: 'success',
      message: 'Presigned URL created',
      data: {
        uploadUrl,
        key,
        bucket,
        expiresIn,
        headers: {
          'Content-Type': contentType,
        },
      },
    });
  });

  static uploadVideo = catchAsync(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded. Use field name "file".', 400);
    }

    const bucket = getBucketForKind('video');
    const key = buildObjectKey(req.user._id.toString(), req.file.originalname, 'video');
    const url = await putObjectBuffer({
      bucket,
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype,
    });

    res.status(201).json({
      status: 'success',
      message: 'Video uploaded successfully',
      data: { key, url, bucket },
    });
  });

  static uploadThumbnail = catchAsync(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded. Use field name "file".', 400);
    }

    const bucket = getBucketForKind('thumbnail');
    const key = buildObjectKey(req.user._id.toString(), req.file.originalname, 'thumbnail');
    const url = await putObjectBuffer({
      bucket,
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype,
    });

    res.status(201).json({
      status: 'success',
      message: 'Thumbnail uploaded successfully',
      data: { key, url, bucket },
    });
  });
}
