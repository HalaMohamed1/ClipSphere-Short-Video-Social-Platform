import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../utils/redisClient.js';
import { sendEmail } from '../services/emailService.js';

// Email Queue definition
export async function createEmailQueue() {
  const connection = await getRedisClient();

  const emailQueue = new Queue('emails', {
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
  emailQueue.on('completed', (job) => {
    console.log(`✓ Email job ${job.id} completed`);
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`✗ Email job ${job.id} failed:`, err.message);
  });

  emailQueue.on('error', (err) => {
    console.error('Email Queue Error:', err);
  });

  return emailQueue;
}

/**
 * Add an email job to the queue
 * @param {Object} data - Email data
 * @param {string} data.to - Recipient email
 * @param {string} data.subject - Email subject
 * @param {string} data.html - Email HTML content
 * @param {Object} options - BullMQ options
 */
export async function addEmailJob(data, options = {}) {
  try {
    const emailQueue = await createEmailQueue();
    const job = await emailQueue.add('send-email', data, {
      ...options,
      jobId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    console.log(`📧 Email job queued: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Error queuing email:', error);
    throw error;
  }
}

/**
 * Create email worker for processing jobs
 * This should be called in the worker process
 */
export async function createEmailWorker() {
  const connection = await getRedisClient();

  const emailWorker = new Worker(
    'emails',
    async (job) => {
      const { to, subject, html } = job.data;

      try {
        // Send email using the email service
        await sendEmail(to, subject, html);
        console.log(`✓ Email sent to: ${to}`);
        return { success: true, recipient: to };
      } catch (error) {
        console.error(`✗ Failed to send email to ${to}:`, error.message);
        throw error;
      }
    },
    {
      connection,
      concurrency: 5, // Process 5 emails in parallel
    }
  );

  emailWorker.on('completed', (job) => {
    console.log(`✓ Worker: Email job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`✗ Worker: Email job ${job.id} failed:`, err.message);
  });

  emailWorker.on('error', (err) => {
    console.error('Email Worker Error:', err);
  });

  return emailWorker;
}
