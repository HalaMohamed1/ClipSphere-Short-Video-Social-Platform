import ffmpeg from 'fluent-ffmpeg';

if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

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
