import { NextResponse } from 'next/server'
import { safeQuery } from '@/lib/db-wrapper'

export async function GET() {
  try {
    console.log('🧪 Testing database connection...')
    
    const adminUser = await safeQuery(async (prisma) => {
      return await prisma.adminUser.findUnique({
        where: { email: 'admin@concrecol.co' },
        select: { id: true, email: true, role: true }
      })
    })

    return NextResponse.json({
      status: 'success',
      message: 'Database connection working!',
      data: adminUser ? {
        userExists: true,
        email: adminUser.email,
        role: adminUser.role
      } : {
        userExists: false
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}