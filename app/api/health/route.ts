import { NextResponse } from 'next/server'
import { safeQuery } from '@/lib/db-wrapper'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection with safe wrapper
    await safeQuery(async (prisma) => {
      return await prisma.$queryRaw`SELECT 1`
    })
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: 'connected',
        server: 'running'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }, { status: 503 })
  }
}