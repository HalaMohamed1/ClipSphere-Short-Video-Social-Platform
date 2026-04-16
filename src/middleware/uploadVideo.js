import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';

const MAX_BYTES = parseInt(process.env.MAX_VIDEO_UPLOAD_MB || '200', 10) * 1024 * 1024;

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, os.tmpdir());
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `clipsphere-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = /^video\//.test(file.mimetype) || file.mimetype === 'application/octet-stream';
  if (!ok) {
    return cb(new Error('Only video files are allowed'));
  }
  cb(null, true);
}

export const uploadVideoFile = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter,
});

export function cleanupTemp(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
}
