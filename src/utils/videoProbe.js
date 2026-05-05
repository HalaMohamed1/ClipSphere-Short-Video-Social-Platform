import ffmpeg from 'fluent-ffmpeg';

/**
 * Returns duration in seconds (float) using ffprobe.
 */
export function probeVideoDurationSeconds(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const d = metadata?.format?.duration;
      if (d == null || Number.isNaN(Number(d))) {
        return reject(new Error('Could not read video duration'));
      }
      resolve(Number(d));
    });
  });
}
