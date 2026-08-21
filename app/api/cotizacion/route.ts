import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// ✅ Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// Asunto descriptivo constante para los mensajes de cotización
const ASUNTO = 'Solicitud de cotización desde el sitio web'

// Esquema de validación (mismo contrato que el formulario público)
const cotizacionSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  telefono: z.string().min(10, 'Número telefónico inválido').max(30),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  producto: z.string().max(200).optional().or(z.literal('')),
  tipoResistencia: z.string().max(200).optional().or(z.literal('')),
  cantidad: z.string().max(100).optional().or(z.literal('')),
  fechaRequerida: z.string().max(50).optional().or(z.literal('')),
  usoPrevisto: z.string().max(500).optional().or(z.literal('')),
  direccionObra: z.string().max(500).optional().or(z.literal('')),
  condicionesAcceso: z.string().max(1000).optional().or(z.literal('')),
  autorizacionDatos: z.boolean().refine((val) => val === true, {
    message: 'Debe autorizar el uso de sus datos',
  }),
})

// Convierte cadenas opcionales vacías a null (donde el modelo lo permite)
function toNullable(value?: string): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validatedData = cotizacionSchema.parse(body)

    // Resolver el slug del producto a su nombre, o guardar "Otro"
    let productoNombre: string | null = null
    if (validatedData.producto === 'otro') {
      productoNombre = 'Otro'
    } else if (validatedData.producto) {
      const product = await prisma.product.findFirst({
        where: { slug: validatedData.producto, is_active: true },
        select: { name: true },
      })
      productoNombre = product?.name ?? null
    }

    // El correo es un campo no nulo en el modelo: un correo omitido se guarda como cadena vacía
    const emailValue =
      validatedData.email && validatedData.email.trim() !== ''
        ? validatedData.email.trim()
        : ''

    const contactMessage = await prisma.contactMessage.create({
      data: {
        nombre: validatedData.nombre.trim(),
        telefono: validatedData.telefono.trim(),
        email: emailValue,
        asunto: ASUNTO,
        mensaje: toNullable(validatedData.tipoResistencia),
        tipo: 'cotizacion',
        producto: productoNombre,
        cantidad: toNullable(validatedData.cantidad),
        fechaRequerida: toNullable(validatedData.fechaRequerida),
        usoPrevisto: toNullable(validatedData.usoPrevisto),
        direccionObra: toNullable(validatedData.direccionObra),
        condicionesAcceso: toNullable(validatedData.condicionesAcceso),
        autorizacionDatos: validatedData.autorizacionDatos,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de cotización enviada correctamente',
        id: contactMessage.id,
      },
      { status: 201 }
    )
  } catch (error) {
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

    console.error('[COTIZACION]', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
