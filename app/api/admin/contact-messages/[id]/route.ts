import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'

// PATCH - Marcar mensaje como leído
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { isRead } = await request.json()
    
    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { isRead },
    })

    return NextResponse.json({
      success: true,
      message: updatedMessage,
    })
    
  } catch (error) {
    console.error('❌ Error al actualizar mensaje:', error)
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