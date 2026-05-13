import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../utils/redisClient.js';
import { Video } from '../db_core/models/Video.js';
import { probeVideoDurationSeconds } from '../utils/videoProbe.js';

// Video Metadata Queue definition
export async function createVideoMetadataQueue() {
  const connection = await getRedisClient();

  const videoMetadataQueue = new Queue('video-metadata', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    },
  });

  // Log queue events
  videoMetadataQueue.on('completed', (job) => {
    console.log(`✓ Video metadata job ${job.id} completed`);
  });

  videoMetadataQueue.on('failed', (job, err) => {
    console.error(`✗ Video metadata job ${job.id} failed:`, err.message);
  });

  videoMetadataQueue.on('error', (err) => {
    console.error('Video Metadata Queue Error:', err);
  });

  return videoMetadataQueue;
}

/**
 * Add a video metadata processing job to the queue
 * @param {Object} data - Video data
 * @param {string} data.videoId - Video MongoDB ID
 * @param {string} data.videoPath - Path to video file
 * @param {Object} options - BullMQ options
 */
export async function addVideoMetadataJob(data, options = {}) {
  try {
    const videoMetadataQueue = await createVideoMetadataQueue();
    const job = await videoMetadataQueue.add('process-metadata', data, {
      ...options,
      jobId: `video-metadata-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    console.log(`🎬 Video metadata job queued: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Error queuing video metadata job:', error);
    throw error;
  }
}

/**
 * Create video metadata worker for processing jobs
 * This should be called in the worker process
 */
export async function createVideoMetadataWorker() {
  const connection = await getRedisClient();

  const videoMetadataWorker = new Worker(
    'video-metadata',
    async (job) => {
      const { videoId, videoPath } = job.data;

      try {
        // Example: Extract and verify video duration
        const durationSeconds = await probeVideoDurationSeconds(videoPath);

        // Update video with metadata
        const video = await Video.findByIdAndUpdate(
          videoId,
          {
            duration: Math.round(durationSeconds),
            metadata: {
              processedAt: new Date(),
              duration: Math.round(durationSeconds),
            },
          },
          { new: true }
        );

        console.log(`✓ Video metadata processed: ${videoId} (${durationSeconds}s)`);
        return { success: true, videoId, duration: durationSeconds };
      } catch (error) {
        console.error(`✗ Failed to process video metadata for ${videoId}:`, error.message);
        throw error;
      }
    },
    {
      connection,
      concurrency: 2, // Process 2 videos in parallel (FFmpeg intensive)
    }
  );

  videoMetadataWorker.on('completed', (job) => {
    console.log(`✓ Worker: Video metadata job ${job.id} completed`);
  });

  videoMetadataWorker.on('failed', (job, err) => {
    console.error(`✗ Worker: Video metadata job ${job.id} failed:`, err.message);
  });

  videoMetadataWorker.on('error', (err) => {
    console.error('Video Metadata Worker Error:', err);
  });

  return videoMetadataWorker;
}
