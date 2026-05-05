import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';

const execFileAsync = promisify(execFile);

/**
 * Extract one JPEG frame (for feed / poster) using ffmpeg.
 * Seek ~5% into the clip to reduce black intro frames.
 */
export async function extractVideoThumbnailJpeg(videoPath, durationSec) {
  const outPath = path.join(os.tmpdir(), `clipsphere-thumb-${randomUUID()}.jpg`);
  const safeDuration = Math.max(durationSec || 1, 0.5);
  const ss = Math.min(
    Math.max(0.2, safeDuration * 0.05),
    Math.max(0.2, safeDuration - 0.1)
  );

  await execFileAsync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-ss',
      String(ss),
      '-i',
      videoPath,
      '-frames:v',
      '1',
      '-vf',
      'scale=640:-1',
      '-q:v',
      '3',
      outPath,
    ],
    { maxBuffer: 10 * 1024 * 1024 }
  );

  if (!fs.existsSync(outPath)) {
    throw new Error('ffmpeg did not write thumbnail file');
  }
  return outPath;
}

export function safeUnlink(p) {
  if (p && fs.existsSync(p)) {
    try {
      fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
  }
}
