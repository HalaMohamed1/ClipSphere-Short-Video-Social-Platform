import multer from 'multer';
import { AppError } from '../utils/appError.js';

const videoMimes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const imageMimes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function parseMaxBytes(envName, fallback) {
  const raw = process.env[envName];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function createUpload({ allowedMimes, maxBytesEnv, fallbackBytes, fieldName }) {
  const limits = { fileSize: parseMaxBytes(maxBytesEnv, fallbackBytes) };

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (allowedMimes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `Invalid file type. Allowed: ${[...allowedMimes].join(', ')}. Received: ${file.mimetype}`,
          400
        )
      );
    }
  };

  const upload = multer({ storage, limits, fileFilter });
  return upload.single(fieldName);
}

/** Multipart field name: `file` */
export const uploadVideoMiddleware = createUpload({
  allowedMimes: videoMimes,
  maxBytesEnv: 'UPLOAD_MAX_BYTES',
  fallbackBytes: 50 * 1024 * 1024,
  fieldName: 'file',
});

/** Multipart field name: `file` */
export const uploadThumbnailMiddleware = createUpload({
  allowedMimes: imageMimes,
  maxBytesEnv: 'UPLOAD_THUMBNAIL_MAX_BYTES',
  fallbackBytes: 5 * 1024 * 1024,
  fieldName: 'file',
});
