import { NextResponse } from 'next/server'
import { safeQuery } from '@/lib/db-wrapper'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    console.log('🔐 Verifying admin user password...')
    
    // Primero buscar el usuario
    const adminUser = await safeQuery(async (prisma) => {
      return await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: 'admin@concrecol.com' },
            { email: 'admin@concrecol.co' }
          ]
        },
        select: { 
          id: true, 
          email: true, 
          role: true, 
          password: true 
        }
      })
    })

    if (!adminUser) {
      return NextResponse.json({
        status: 'error',
        message: 'Admin user not found',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Verificar si la contraseña actual es correcta
    const isPasswordValid = await bcrypt.compare('admin123', adminUser.password)
    
    if (isPasswordValid) {
      return NextResponse.json({
        status: 'success',
        message: 'Password is correct!',
        data: {
          email: adminUser.email,
          role: adminUser.role,
          passwordStatus: 'valid'
        },
        timestamp: new Date().toISOString()
      })
    } else {
      // Si la contraseña no es válida, vamos a regenerarla
      console.log('🔧 Password invalid, regenerating...')
      
      const newHashedPassword = await bcrypt.hash('admin123', 12)
      
      const updatedUser = await safeQuery(async (prisma) => {
        return await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: { password: newHashedPassword },
          select: { id: true, email: true, role: true }
        })
      })

      return NextResponse.json({
        status: 'success',
        message: 'Password has been reset to admin123',
        data: {
          email: updatedUser.email,
          role: updatedUser.role,
          passwordStatus: 'reset'
        },
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('❌ Password verification failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Password verification failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('🔧 Force password reset...')
    
    // Buscar usuario admin
    const adminUser = await safeQuery(async (prisma) => {
      return await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: 'admin@concrecol.com' },
            { email: 'admin@concrecol.co' }
          ]
        }
      })
    })

    if (!adminUser) {
      return NextResponse.json({
        status: 'error',
        message: 'Admin user not found',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Generar nueva contraseña hasheada
    const newHashedPassword = await bcrypt.hash('admin123', 12)
    
    const updatedUser = await safeQuery(async (prisma) => {
      return await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { password: newHashedPassword },
        select: { id: true, email: true, role: true }
      })
    })

    return NextResponse.json({
      status: 'success',
      message: 'Password forcibly reset to admin123',
      data: {
        email: updatedUser.email,
        role: updatedUser.role
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Force password reset failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Force password reset failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}