import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  ADMIN_DEFAULT_EMAIL: z.string().email('ADMIN_DEFAULT_EMAIL must be valid email'),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8, 'ADMIN_DEFAULT_PASSWORD must be at least 8 characters'),
  
  // Stripe (optional for development)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SALES_EMAIL: z.string().email().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Validar variables de entorno al startup
export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    
    // En producción, fallar completamente
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    
    // En desarrollo, mostrar advertencia pero continuar
    console.warn('⚠️  Continuing in development mode with invalid env vars')
    return process.env as any
  }
}

// Validar solo las variables críticas para desarrollo
export function validateDevEnv() {
  const criticalEnvSchema = z.object({
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  })
  
  try {
    return criticalEnvSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Missing critical environment variables:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    console.error('\n💡 Please check your .env file and ensure all required variables are set.')
    process.exit(1)
  }
}

// Tipo de las variables de entorno validadas
export type ValidatedEnv = z.infer<typeof envSchema>