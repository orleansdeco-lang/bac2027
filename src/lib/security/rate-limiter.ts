/**
 * In-Memory Sliding Window Rate Limiter
 * Protects AI and API routes against quota exhaustion and DoS attacks
 */

interface RateLimitRecord {
  timestamps: number[];
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private lastCleanup: number = Date.now();
  private readonly cleanupIntervalMs: number = 60000; // 1 minute

  /**
   * Evaluates if a request should be allowed under the rate limit.
   * @param identifier Unique key (e.g., user ID, IP address, or session token)
   * @param limit Maximum allowed requests within the window (default: 15)
   * @param windowMs Time window in milliseconds (default: 60,000ms = 1 minute)
   */
  public check(
    identifier: string,
    limit: number = 15,
    windowMs: number = 60000
  ): {
    success: boolean;
    limit: number;
    remaining: number;
    resetSeconds: number;
  } {
    const now = Date.now();
    this.maybeCleanup(windowMs);

    const record = this.store.get(identifier) || { timestamps: [] };
    const windowStart = now - windowMs;

    // Filter out timestamps outside the current window
    const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= limit) {
      const oldestValid = validTimestamps[0];
      const resetSeconds = Math.max(1, Math.ceil((oldestValid + windowMs - now) / 1000));
      return {
        success: false,
        limit,
        remaining: 0,
        resetSeconds,
      };
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.store.set(identifier, { timestamps: validTimestamps });

    const remaining = Math.max(0, limit - validTimestamps.length);
    const resetSeconds = Math.ceil(windowMs / 1000);

    return {
      success: true,
      limit,
      remaining,
      resetSeconds,
    };
  }

  /**
   * Resets rate limit for a specific identifier (useful for tests)
   */
  public reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Cleans up expired entries periodically to prevent memory leaks
   */
  private maybeCleanup(windowMs: number): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;

    this.lastCleanup = now;
    const cutoff = now - windowMs;

    this.store.forEach((record: RateLimitRecord, key: string) => {
      const active = record.timestamps.filter((t: number) => t > cutoff);
      if (active.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, { timestamps: active });
      }
    });
  }
}

export const rateLimiter = new InMemoryRateLimiter();
