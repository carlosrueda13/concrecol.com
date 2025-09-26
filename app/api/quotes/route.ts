import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateQuotePDF } from '@/lib/generate-quote-pdf'
import { sendEmail, SALES_EMAIL } from '@/lib/email'
import { generateQuoteClientEmailHtml, generateQuoteSalesEmailHtml } from '@/lib/email-templates'
import { sanitizeObject, sanitizeEmail, sanitizePhone } from '@/lib/sanitization'
import path from 'path'
import crypto from 'crypto'

// ✅ Schema mejorado con validación más estricta
const quoteRequestSchema = z.object({
  customerEmail: z.string()
    .email('Email inválido')
    .max(255, 'Email demasiado largo'),
  customerPhone: z.string()
    .min(10, 'Teléfono inválido')
    .max(20, 'Teléfono demasiado largo')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido'),
  customerName: z.string()
    .min(2, 'Nombre demasiado corto')
    .max(100, 'Nombre demasiado largo')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'El nombre solo puede contener letras y espacios'),
  notes: z.string()
    .max(1000, 'Las notas son demasiado largas')
    .optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // ✅ Sanitizar datos de entrada
    const sanitizedBody = sanitizeObject(body)
    const { customerEmail, customerPhone, customerName, notes } = quoteRequestSchema.parse(sanitizedBody)
    
    // ✅ Sanitización adicional específica
    const cleanEmail = sanitizeEmail(customerEmail)
    const cleanPhone = sanitizePhone(customerPhone)

    // Get cart
    const cartId = cookies().get('cartId')?.value
    if (!cartId) {
      return NextResponse.json(
        { error: 'Carrito no encontrado' },
        { status: 404 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                sqlCategory: true,
              },
            },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Carrito vacío' },
        { status: 400 }
      )
    }

    // Generate quote number
    const quoteNumber = crypto.randomUUID()

    // Generate PDF
    const pdfPath = await generateQuotePDF({
      items: cart.items,
      quoteNumber,
      customerName,
      customerEmail: cleanEmail,
      customerPhone: cleanPhone,
      notes,
    })

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (total, item) => total + item.product.price_per_unit * item.quantity,
      0
    )

    // Generate absolute path to PDF file
    const absolutePdfPath = path.join(process.cwd(), 'public', pdfPath)
    
    // Send email to customer
    await sendEmail({
      to: cleanEmail,
      subject: `Cotización #${quoteNumber} - Concrecol`,
      html: generateQuoteClientEmailHtml({
        customerName,
        customerEmail,
        customerPhone,
        notes,
        items: cart.items,
        quoteNumber,
        subtotal,
        pdfPath,
      }),
      attachments: [
        {
          filename: `cotizacion-${quoteNumber}.pdf`,
          path: absolutePdfPath,
        },
      ],
    })

    // Send email to sales department
    await sendEmail({
      to: SALES_EMAIL,
      subject: `Nueva Solicitud de Cotización #${quoteNumber}`,
      html: generateQuoteSalesEmailHtml({
        customerName,
        customerEmail,
        customerPhone,
        notes,
        items: cart.items,
        quoteNumber,
        subtotal,
        pdfPath,
      }),
      attachments: [
        {
          filename: `cotizacion-${quoteNumber}.pdf`,
          path: absolutePdfPath,
        },
      ],
    })

    // Return the PDF path and success message
    return NextResponse.json({
      success: true,
      message: 'Cotización generada y enviada exitosamente',
      quoteNumber,
      pdfPath,
    })
  } catch (error) {
    console.error('[QUOTE_ERROR]', error)
    return NextResponse.json(
      { error: 'Error al generar la cotización' },
      { status: 500 }
    )
  }
}
