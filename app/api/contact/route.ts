import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Esquema de validación
const contactSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().min(10, 'Número telefónico inválido'),
  asunto: z.string().min(3, 'El asunto debe tener al menos 3 caracteres'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const body = await request.json()
    
    // Validar datos
    const validatedData = contactSchema.parse(body)
    
    // Guardar en base de datos
    const contactMessage = await prisma.contactMessage.create({
      data: {
        nombre: validatedData.nombre,
        email: validatedData.email,
        telefono: validatedData.telefono,
        asunto: validatedData.asunto,
        mensaje: validatedData.mensaje,
      },
    })

    console.log('📧 Nuevo mensaje de contacto recibido:', {
      id: contactMessage.id,
      email: contactMessage.email,
      asunto: contactMessage.asunto,
    })

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      id: contactMessage.id,
    })
    
  } catch (error) {
    console.error('❌ Error al procesar mensaje de contacto:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        },
        { status: 400 }
      )
    }
    
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

// GET para obtener estadísticas (solo para admin)
export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    const totalMessages = await prisma.contactMessage.count()
    const unreadMessages = await prisma.contactMessage.count({
      where: { isRead: false }
    })
    
    return NextResponse.json({
      success: true,
      stats: {
        total: totalMessages,
        unread: unreadMessages,
      }
    })
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener estadísticas',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}