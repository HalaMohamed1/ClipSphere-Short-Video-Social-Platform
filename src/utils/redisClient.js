import { createClient } from 'redis';

let redisClient = null;
let redisConnectionFailed = false; // Flag to prevent repeated errors
const MAX_CONNECT_ATTEMPTS = 3;

export async function getRedisClient() {
  if (!redisClient && !redisConnectionFailed) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: () => {
          // Don't reconnect if connection has already failed
          if (redisConnectionFailed) {
            return new Error('Redis connection disabled');
          }
          // Fail fast on first attempt
          return new Error('Initial connection failed');
        },
        connectTimeout: 5000, // 5 second timeout for initial connection
      },
    });

    // Only attach listeners if connection succeeds
    const handleConnect = () => {
      console.log('✓ Redis Client Connected');
    };

    const handleError = (err) => {
      // Silently ignore errors once connection has failed
      if (!redisConnectionFailed) {
        // Only log first error
      }
    };

    redisClient.on('connect', handleConnect);
    redisClient.on('error', handleError);

    try {
      // Try to connect with a timeout
      const connectionPromise = redisClient.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 8000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      return redisClient;
    } catch (err) {
      redisConnectionFailed = true; // Flag to prevent future attempts
      
      // Remove listeners and cleanup
      if (redisClient) {
        try {
          redisClient.removeAllListeners();
        } catch (e) {
          // Ignore listener removal errors
        }
      }
      
      redisClient = null;
      console.warn(`⚠️  Redis connection failed (optional): ${err.message}`);
      console.log('   The server will continue without Redis. Caching and job queues disabled.');
      throw err;
    }
  }

  if (redisConnectionFailed) {
    throw new Error('Redis is not available');
  }

  return redisClient;
}

export async function closeRedisClient() {
  if (redisClient) {
    try {
      redisClient.removeAllListeners();
      await redisClient.quit();
    } catch (err) {
      // Ignore cleanup errors
    }
    redisClient = null;
  }
}
