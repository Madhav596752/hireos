// src/config/redis.js
// Redis is OPTIONAL — app works perfectly without it
// If Redis unavailable, all cache ops silently return null

let redis = null;
let redisAvailable = false;

async function tryConnect() {
  try {
    const { default: Redis } = await import("ioredis");
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 2 ? null : 500),
    });
    redis.on("connect", () => {
      redisAvailable = true;
      console.log("[Redis] Connected ✓");
    });
    redis.on("error", () => {
      redisAvailable = false;
    });
    await redis.connect();
  } catch {
    redisAvailable = false;
    console.log("[Redis] Not available — running without cache (this is fine)");
  }
}

// Try to connect on startup but don't block
tryConnect();

export async function cacheGet(key) {
  if (!redisAvailable || !redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds = 60) {
  if (!redisAvailable || !redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // silent
  }
}

export async function cacheDel(pattern) {
  if (!redisAvailable || !redis) return;
  try {
    // If pattern has wildcard, use keys + del
    if (pattern.includes("*")) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } else {
      await redis.del(pattern);
    }
  } catch {
    // silent
  }
}

export default { cacheGet, cacheSet, cacheDel };
