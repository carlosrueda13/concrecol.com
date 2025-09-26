import { NextResponse } from 'next/server'
import { safeQuery } from '@/lib/db-wrapper'

export async function GET() {
  try {
    // Check if admin user exists (app is properly seeded)
    const adminExists = await safeQuery(async (prisma) => {
      return await prisma.adminUser.findFirst()
    })
    
    if (!adminExists) {
      throw new Error('Admin user not found - app not ready')
    }
    
    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}