import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from './rate-limit';

/**
 * Check rate limit and return error response if exceeded
 * @param req - Request object
 * @param limit - Maximum requests allowed (default: 10)
 * @param window - Time window in ms (default: 60000 = 1 minute)
 * @returns NextResponse with 429 status if rate limit exceeded, null otherwise
 */
export function checkRateLimit(
  req: Request,
  limit: number = 10,
  window: number = 60000
): NextResponse | null {
  const clientIp = getClientIp(req);
  const rateLimitResult = rateLimit(clientIp, { limit, window });
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded', 
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  return null;
}

/**
 * Validate AI response size to prevent memory exhaustion
 * @param response - AI response string
 * @param maxSize - Maximum size in bytes (default: 50000 = 50KB)
 * @throws Error if response is too large
 */
export function validateResponseSize(response: string, maxSize: number = 50000): void {
  if (response && response.length > maxSize) {
    throw new Error(`Response too large: ${response.length} bytes (max: ${maxSize})`);
  }
}

