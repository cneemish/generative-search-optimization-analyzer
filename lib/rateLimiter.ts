/**
 * Rate Limiter Utility
 * 
 * This implements a simple in-memory rate limiting system that tracks requests per IP address.
 * 
 * How it works:
 * 1. Extracts IP address from request headers (with fallback for development)
 * 2. Tracks request count per IP in a Map with timestamps
 * 3. Resets counters daily (at midnight UTC)
 * 4. Limits to MAX_REQUESTS_PER_DAY (3) per IP
 * 
 * Limitations:
 * - In-memory storage: Data is lost on server restart
 * - IP-based tracking: Can be bypassed with VPN/proxy
 * - No persistence: Not suitable for multi-server deployments
 * 
 * For production, consider:
 * - Redis for distributed rate limiting
 * - Database storage for persistent tracking
 * - Cookie/session-based tracking for better accuracy
 * - User authentication for more reliable tracking
 */

interface RateLimitData {
  count: number;
  resetAt: number; // Timestamp when the limit resets
}

const MAX_REQUESTS_PER_DAY = 3;
const RATE_LIMIT_STORE = new Map<string, RateLimitData>();

// Clean up old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of RATE_LIMIT_STORE.entries()) {
    if (now >= data.resetAt) {
      RATE_LIMIT_STORE.delete(ip);
    }
  }
}, 60 * 60 * 1000); // 1 hour

/**
 * Get the client's IP address from the request
 */
function getClientIP(req: any): string {
  // Try various headers that might contain the real IP
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
  
  // If forwarded header exists, get the first IP (client's original IP)
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback to real IP header
  if (realIP) {
    return realIP;
  }
  
  // Cloudflare IP
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to socket IP (for development)
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Get the timestamp for midnight UTC today
 */
function getTodayMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1, // Next day
    0, 0, 0, 0
  ));
  return midnight.getTime();
}

/**
 * Check if the request should be rate limited
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(req: any): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const ip = getClientIP(req);
  const now = Date.now();
  const resetAt = getTodayMidnightUTC();
  
  // Get existing data or create new
  let data = RATE_LIMIT_STORE.get(ip);
  
  // If data doesn't exist or has expired, reset it
  if (!data || now >= data.resetAt) {
    data = {
      count: 0,
      resetAt: resetAt,
    };
    RATE_LIMIT_STORE.set(ip, data);
  }
  
  // Increment count
  data.count += 1;
  RATE_LIMIT_STORE.set(ip, data);
  
  const remaining = Math.max(0, MAX_REQUESTS_PER_DAY - data.count);
  const allowed = data.count <= MAX_REQUESTS_PER_DAY;
  
  return {
    allowed,
    remaining,
    resetAt: data.resetAt,
    limit: MAX_REQUESTS_PER_DAY,
  };
}

/**
 * Get rate limit info without incrementing the counter
 */
export function getRateLimitInfo(req: any): {
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const ip = getClientIP(req);
  const now = Date.now();
  const resetAt = getTodayMidnightUTC();
  
  let data = RATE_LIMIT_STORE.get(ip);
  
  // If data doesn't exist or has expired
  if (!data || now >= data.resetAt) {
    return {
      remaining: MAX_REQUESTS_PER_DAY,
      resetAt: resetAt,
      limit: MAX_REQUESTS_PER_DAY,
    };
  }
  
  const remaining = Math.max(0, MAX_REQUESTS_PER_DAY - data.count);
  
  return {
    remaining,
    resetAt: data.resetAt,
    limit: MAX_REQUESTS_PER_DAY,
  };
}

