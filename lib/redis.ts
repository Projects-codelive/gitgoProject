import Redis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || ""

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  // Dual-Environment Check:
  // If we are on localhost (mongodb mode) and don't explicitly have a REDIS_URL, 
  // we do not attempt to connect to Redis. This prevents ECONNREFUSED console spam 
  // for local developers who haven't installed a local Redis server.
  const isLocalDev = process.env.DATABASE_MODE === 'mongodb' || process.env.DATABASE_MODE === undefined;

  if (isLocalDev && !process.env.REDIS_URL) {
    return null; // Fail open (caching disabled locally)
  }

  if (!redis) {
    const connectionUrl = REDIS_URL || "redis://localhost:6379";
    redis = new Redis(connectionUrl, {
      maxRetriesPerRequest: 1, // Don't retry infinitely if down
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 50, 2000)
      },
    })

    redis.on("error", (err: any) => {
      // Suppress massive connection error spam if it fails once
      if (err.code !== 'ECONNREFUSED') {
        console.error("Redis Client Error:", err)
      }
    })

    redis.on("connect", () => {
      console.log("Redis Client Connected")
    })
  }

  return redis
}

// Cache TTL constants
export const CACHE_TTL = {
  USER_BASIC: 60 * 60, // 1 hour
  REPO_LIST: 60 * 30, // 30 minutes
  REPO_DETAIL: 60 * 60 * 24, // 24 hours
}

// Helper functions for caching
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    if (!client) return null; // Graceful skip
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    // console.error("Redis GET error:", error)
    return null
  }
}

export async function setCached(
  key: string,
  value: any,
  ttl: number
): Promise<void> {
  try {
    const client = getRedisClient()
    if (!client) return; // Graceful skip
    await client.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    // console.error("Redis SET error:", error)
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    const client = getRedisClient()
    if (!client) return; // Graceful skip
    await client.del(key)
  } catch (error) {
    // console.error("Redis DEL error:", error)
  }
}

export async function deletePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient()
    if (!client) return; // Graceful skip
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch (error) {
    // console.error("Redis DELETE PATTERN error:", error)
  }
}
