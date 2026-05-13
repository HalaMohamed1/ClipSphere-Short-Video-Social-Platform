import { getRedisClient } from './redisClient.js';

const DEFAULT_TTL = 300;

export function generateCacheKey(prefix, ...params) {
  return `${prefix}:${params.join(':')}`;
}

export async function getCachedValue(key) {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(`Redis GET error for key ${key}:`, error.message);
    return null;
  }
}

export async function setCachedValue(key, value, ttl = DEFAULT_TTL) {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.warn(`Redis SET error for key ${key}:`, error.message);
  }
}

export async function deleteCachedValue(key) {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.warn(`Redis DEL error for key ${key}:`, error.message);
  }
}

export async function deletePatternKeys(pattern) {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.warn(`Redis DEL pattern error for pattern ${pattern}:`, error.message);
  }
}

export async function incrementCachedValue(key, amount = 1) {
  try {
    const client = await getRedisClient();
    return await client.incrBy(key, amount);
  } catch (error) {
    console.warn(`Redis INCRBY error for key ${key}:`, error.message);
    return null;
  }
}


export async function decrementCachedValue(key, amount = 1) {
  try {
    const client = await getRedisClient();
    return await client.decrBy(key, amount);
  } catch (error) {
    console.warn(`Redis DECRBY error for key ${key}:`, error.message);
    return null;
  }
}

/**
 * Check if a cache key exists
 */
export async function isCacheKeyExists(key) {
  try {
    const client = await getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.warn(`Redis EXISTS error for key ${key}:`, error.message);
    return false;
  }
}
