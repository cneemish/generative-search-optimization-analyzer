# Rate Limiting Implementation

## Overview

This project implements a rate limiting system that restricts users to **3 requests per day** to prevent API abuse and control costs.

## How It Works

### 1. **IP-Based Tracking**

The rate limiter identifies users by their IP address, which is extracted from HTTP request headers in the following priority order:

1. `x-forwarded-for` header (most common in production with proxies/CDNs)
2. `x-real-ip` header (used by some proxies)
3. `cf-connecting-ip` header (Cloudflare)
4. `req.socket.remoteAddress` (fallback for development)

**Location**: `lib/rateLimiter.ts` - `getClientIP()` function

### 2. **Daily Reset Mechanism**

- Each IP address has a request counter that resets at **midnight UTC** each day
- The reset timestamp is calculated when the first request is made
- Expired entries are automatically cleaned up every hour

**Location**: `lib/rateLimiter.ts` - `getTodayMidnightUTC()` function

### 3. **In-Memory Storage**

The rate limit data is stored in a JavaScript `Map` object:
- **Key**: IP address (string)
- **Value**: Object containing `count` and `resetAt` timestamp

**Storage**: `RATE_LIMIT_STORE` Map in `lib/rateLimiter.ts`

### 4. **Request Flow**

1. User makes a request to `/api/analyze`
2. API route calls `checkRateLimit(req)` 
3. Rate limiter:
   - Extracts IP address
   - Checks if IP exists in store
   - If expired or doesn't exist, creates new entry with count = 0
   - Increments count
   - Returns `allowed`, `remaining`, `resetAt`, and `limit`
4. If `allowed = false`, API returns HTTP 429 (Too Many Requests)
5. If `allowed = true`, request proceeds and response includes remaining requests info

**Location**: `pages/api/analyze.ts` - `handler()` function

## Implementation Details

### Rate Limiter Functions

#### `checkRateLimit(req)`
- Checks if request should be allowed
- Increments the request counter
- Returns: `{ allowed: boolean, remaining: number, resetAt: number, limit: number }`

#### `getRateLimitInfo(req)`
- Gets rate limit info without incrementing counter
- Used to return remaining requests in successful responses
- Returns: `{ remaining: number, resetAt: number, limit: number }`

### API Response

**Success Response (200):**
```json
{
  "gemini": "...",
  "chatgpt": "...",
  "remaining": 2,
  "resetAt": 1735689600000,
  "limit": 3
}
```

**Rate Limit Exceeded (429):**
```json
{
  "error": "Rate limit exceeded. You have used all 3 requests for today. Please try again tomorrow.",
  "remaining": 0,
  "resetAt": 1735689600000,
  "limit": 3
}
```

## Frontend Integration

### Request Counter Display

The form shows remaining requests:
```
2 / 3 requests remaining today
```

### Button State

- **Enabled**: When `remaining > 0` or `remaining === null` (first load)
- **Disabled**: When `remaining === 0`

### Refresh Button

After analysis completes, a "New Analysis" button appears:
- Clears the form
- Resets the result display
- Allows starting a new analysis (if requests remain)

**Location**: `components/searchResult.tsx` - `ComparisonResultDisplay` component

## Limitations & Considerations

### Current Implementation Limitations

1. **In-Memory Storage**
   - Data is lost on server restart
   - Not suitable for multi-server deployments
   - Not persistent across server restarts

2. **IP-Based Tracking**
   - Can be bypassed with VPN/proxy
   - Users behind NAT may share the same IP
   - May not accurately identify individual users

3. **No Persistence**
   - Rate limit data doesn't survive server restarts
   - All counters reset when server restarts

### Production Recommendations

For a production environment, consider:

1. **Redis for Storage**
   ```typescript
   // Use Redis instead of in-memory Map
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);
   ```

2. **Database Storage**
   - Store rate limit data in PostgreSQL/MongoDB
   - Persist across restarts
   - Enable analytics

3. **User Authentication**
   - Track by user ID instead of IP
   - More accurate user identification
   - Better for paid/free tiers

4. **Cookie/Session Tracking**
   - More reliable than IP alone
   - Works better with VPN/proxy users
   - Can combine with IP for better accuracy

5. **Distributed Rate Limiting**
   - Use Redis for shared state across servers
   - Implement sliding window algorithm
   - Better for high-traffic applications

## Configuration

To change the daily limit, modify `MAX_REQUESTS_PER_DAY` in `lib/rateLimiter.ts`:

```typescript
const MAX_REQUESTS_PER_DAY = 3; // Change this value
```

## Testing

To test rate limiting:

1. Make 3 requests from the same IP
2. 4th request should return 429 error
3. Wait until midnight UTC or restart server to reset

## Security Considerations

- Rate limiting helps prevent:
  - API abuse
  - Cost overruns
  - DDoS attacks (basic protection)
  - Resource exhaustion

- This implementation is **basic** and should be enhanced for production:
  - Add CAPTCHA after limit reached
  - Implement exponential backoff
  - Add user authentication
  - Use more sophisticated algorithms (sliding window, token bucket)

