import { createClient } from 'redis';

let redisClient = null;
let redisConnectionFailed = false;
const MAX_CONNECT_ATTEMPTS = 3;

export async function getRedisClient() {
  if (!redisClient && !redisConnectionFailed) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: () => {
          if (redisConnectionFailed) {
            return new Error('Redis connection disabled');
          }
          return new Error('Initial connection failed');
        },
        connectTimeout: 5000,
      },
    });

    const handleConnect = () => {
      console.log('✓ Redis Client Connected');
    };

    const handleError = (err) => {
      if (!redisConnectionFailed) {
      }
    };

    redisClient.on('connect', handleConnect);
    redisClient.on('error', handleError);

    try {
      const connectionPromise = redisClient.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 8000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      return redisClient;
    } catch (err) {
      redisConnectionFailed = true;
      
      if (redisClient) {
        try {
          redisClient.removeAllListeners();
        } catch (e) {
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
