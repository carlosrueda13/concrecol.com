import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

// ✅ Schema de validación mejorado para URLs de imagen
const imageUrlSchema = z.string()
  .url('URL inválida')
  .refine(
    (url) => {
      // Validar que sea una URL de imagen
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
      const urlPath = new URL(url).pathname.toLowerCase()
      return imageExtensions.some(ext => urlPath.endsWith(ext))
    },
    'La URL debe ser una imagen válida'
  )
  .refine(
    (url) => {
      // Validar dominios permitidos
      const allowedDomains = ['res.cloudinary.com', 'images.unsplash.com', 'githubusercontent.com']
      const domain = new URL(url).hostname
      return allowedDomains.some(allowed => domain.includes(allowed))
    },
    'Dominio no permitido'
  )

export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdminAuth() // ✅ Usar nueva función de auth
    
    const { imageUrl } = await req.json()
    
    // ✅ Validar URL con schema
    const validatedUrl = imageUrlSchema.parse(imageUrl)
    
    // Record image upload in audit log
    await prisma.auditLog.create({
      data: {
        action: 'IMAGE_UPLOAD',
        entity: 'IMAGE',
        entityId: Math.random().toString(36).substring(7),
        adminId: admin.id,
        details: {
          message: `Image uploaded: ${validatedUrl}`,
          imageUrl: validatedUrl
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      imageUrl: validatedUrl 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
