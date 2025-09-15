import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export async function getRateLimiter() {
  // If Redis is not configured, use in-memory rate limiting
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    const attempts = new Map()
    return {
      limit: async (identifier: string) => {
        const now = Date.now()
        const windowSize = 60 * 1000 // 1 minute
        const maxAttempts = 5

        const userAttempts = attempts.get(identifier) || []
        const windowStart = now - windowSize
        
        // Clean old attempts
        const recentAttempts = userAttempts.filter((timestamp: number) => timestamp > windowStart)
        attempts.set(identifier, recentAttempts)

        if (recentAttempts.length >= maxAttempts) {
          return { success: false }
        }

        recentAttempts.push(now)
        attempts.set(identifier, recentAttempts)
        
        return { success: true }
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
