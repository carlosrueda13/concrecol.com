import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schema de validación
const adminSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  masterKey: z.string().min(1, 'Clave maestra requerida')
})

const deleteAdminSchema = z.object({
  email: z.string().email('Email inválido'),
  masterKey: z.string().min(1, 'Clave maestra requerida')
})

// Lista de super administradores autorizados
const AUTHORIZED_SUPER_ADMINS = [
  'admin@concrecol.co'
]

// POST - Crear/actualizar administrador
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)
    
    // Verificación 1: Sesión activa de admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificación 2: Super admin autorizado
    if (!AUTHORIZED_SUPER_ADMINS.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, message: 'Solo super administradores pueden realizar esta acción' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = adminSchema.parse(body)

    // Verificación 3: Clave maestra
    const masterKey = process.env.ADMIN_MASTER_KEY
    if (!masterKey || validatedData.masterKey !== masterKey) {
      return NextResponse.json(
        { success: false, message: 'Clave maestra incorrecta' },
        { status: 403 }
      )
    }

    // Crear/actualizar admin
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    const admin = await (prisma as any).adminUser.upsert({
      where: { email: validatedData.email },
      update: { 
        password: hashedPassword 
      },
      create: {
        email: validatedData.email,
        password: hashedPassword,
        role: 'admin'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Administrador procesado exitosamente',
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Error al gestionar admin:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Listar administradores (solo para super admins)
export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!AUTHORIZED_SUPER_ADMINS.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, message: 'Solo super administradores pueden ver esta información' },
        { status: 403 }
      )
    }

    const admins = await (prisma as any).adminUser.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      admins
    })

  } catch (error) {
    console.error('❌ Error al obtener administradores:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Eliminar administrador
export async function DELETE(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!AUTHORIZED_SUPER_ADMINS.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, message: 'Solo super administradores pueden realizar esta acción' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = deleteAdminSchema.parse(body)

    // Verificación de clave maestra
    const masterKey = process.env.ADMIN_MASTER_KEY
    if (!masterKey || validatedData.masterKey !== masterKey) {
      return NextResponse.json(
        { success: false, message: 'Clave maestra incorrecta' },
        { status: 403 }
      )
    }

    // No permitir eliminar super admins
    if (AUTHORIZED_SUPER_ADMINS.includes(validatedData.email)) {
      return NextResponse.json(
        { success: false, message: 'No se puede eliminar un super administrador' },
        { status: 403 }
      )
    }

    // Verificar que no sea el último admin
    const totalAdmins = await (prisma as any).adminUser.count()
    if (totalAdmins <= 1) {
      return NextResponse.json(
        { success: false, message: 'No se puede eliminar el último administrador' },
        { status: 403 }
      )
    }

    await (prisma as any).adminUser.delete({
      where: { email: validatedData.email }
    })

    return NextResponse.json({
      success: true,
      message: 'Administrador eliminado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error al eliminar admin:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}