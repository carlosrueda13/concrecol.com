import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export async function getRateLimiter() {
  // If Redis is not configured, use in-memory rate limiting
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    const attempts = new Map()
    const maxAttempts = 5
    const windowSize = 60 * 1000 // 1 minute
    
    return {
      limit: async (identifier: string) => {
        const now = Date.now()
        const windowStart = now - windowSize

        const userAttempts = attempts.get(identifier) || []
        
        // Clean old attempts
        const recentAttempts = userAttempts.filter((timestamp: number) => timestamp > windowStart)
        attempts.set(identifier, recentAttempts)

        const remaining = Math.max(0, maxAttempts - recentAttempts.length)
        const success = recentAttempts.length < maxAttempts

        if (success) {
          recentAttempts.push(now)
          attempts.set(identifier, recentAttempts)
        }
        
        return { 
          success,
          limit: maxAttempts,
          remaining: success ? remaining - 1 : 0,
          reset: now + windowSize
        }
      }
    }
  }

  // Use Upstash Redis rate limiting in production
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  })

  return limiter
}
