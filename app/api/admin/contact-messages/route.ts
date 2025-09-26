import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'

// GET - Obtener todos los mensajes de contacto (solo admin)
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

    const messages = await (prisma as any).contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      messages,
    })
    
  } catch (error) {
    console.error('❌ Error al obtener mensajes:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}