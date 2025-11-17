/**
 * Simple in-memory rate limiter
 * For production, consider using @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory (resets on server restart)
const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   * @default 10
   */
  limit?: number;
  
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  window?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const limit = config.limit ?? 10;
  const window = config.window ?? 60000; // 1 minute default
  
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  // No entry or expired entry - create new one
  if (!entry || now > entry.resetTime) {
    const resetTime = now + window;
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime,
    });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    };
  }
  
  // Entry exists and is still valid
  if (entry.count < limit) {
    entry.count++;
    return {
      success: true,
      limit,
      remaining: limit - entry.count,
      reset: entry.resetTime,
    };
  }
  
  // Rate limit exceeded
  return {
    success: false,
    limit,
    remaining: 0,
    reset: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 * @param request - Next.js request object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const headers = request.headers;
  
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('x-client-ip') ||
    'unknown'
  );
}

/**
 * Clear rate limit for a specific identifier (useful for testing)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string, config: RateLimitConfig = {}): RateLimitResult {
  const limit = config.limit ?? 10;
  const window = config.window ?? 60000;
  
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + window,
    };
  }
  
  return {
    success: entry.count < limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetTime,
  };
}

