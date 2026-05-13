import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '.env');
console.log(`\n🔧 Worker Process Starting...`);
console.log(` Loading .env from: ${envPath}`);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error(`  Error loading .env file: ${result.error.message}`);
} else {
  console.log(` .env file loaded. Parsed ${Object.keys(result.parsed || {}).length} variables`);
}

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/clipsphere';
  console.log('  MONGODB_URI not found, using default: mongodb://localhost:27017/clipsphere');
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

console.log(` MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(` NODE_ENV: ${process.env.NODE_ENV}\n`);

import { connectDB } from './utils/database.js';
import { createEmailWorker } from './queues/emailQueue.js';
import { createVideoMetadataWorker } from './queues/videoMetadataQueue.js';
import { getRedisClient, closeRedisClient } from './utils/redisClient.js';

async function startWorkerProcess() {
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectDB();
    console.log('✓ MongoDB Connected\n');

    // Connect to Redis
    console.log('💾 Connecting to Redis...');
    await getRedisClient();
    console.log('✓ Redis Connected\n');

    // Start Email Worker
    console.log('📧 Starting Email Worker...');
    const emailWorker = await createEmailWorker();
    console.log('✓ Email Worker Started\n');

    // Start Video Metadata Worker
    console.log('🎬 Starting Video Metadata Worker...');
    const videoMetadataWorker = await createVideoMetadataWorker();
    console.log('✓ Video Metadata Worker Started\n');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✓ Worker Process Ready - Listening for Jobs');
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.on('SIGINT', async () => {
      console.log('\n\n⚠️  Shutting down worker process...');

      try {
        await emailWorker.close();
        console.log('✓ Email Worker closed');
      } catch (err) {
        console.error('Error closing email worker:', err);
      }

      try {
        await videoMetadataWorker.close();
        console.log('✓ Video Metadata Worker closed');
      } catch (err) {
        console.error('Error closing video metadata worker:', err);
      }

      try {
        await closeRedisClient();
        console.log('✓ Redis Client closed');
      } catch (err) {
        console.error('Error closing Redis client:', err);
      }

      console.log('✓ Worker process shutdown complete\n');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n⚠️  Shutting down worker process (SIGTERM)...');

      try {
        await emailWorker.close();
        await videoMetadataWorker.close();
        await closeRedisClient();
        console.log('✓ Worker process shutdown complete\n');
      } catch (err) {
        console.error('Error during graceful shutdown:', err);
      }

      process.exit(0);
    });
  } catch (error) {
    console.error('✗ Error starting worker process:', error);
    process.exit(1);
  }
}

// Start the worker process
startWorkerProcess();
