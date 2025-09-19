import PDFDocument from 'pdfkit'
import { CartItem } from '@prisma/client'
import { formatPrice } from '@/lib/utils'
import fs from 'fs'
import path from 'path'

interface QuoteInput {
  items: (CartItem & {
    product: {
      name: string
      price_per_unit: number
      unit_measure: string
      sqlCategory: {
        name: string
      }
    }
  })[]
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  notes?: string
}

export async function generateQuotePDF({
  items,
  quoteNumber,
  customerName,
  customerEmail,
  customerPhone,
  notes,
}: QuoteInput): Promise<string> {
  // Create the PDF document with margin
  const doc = new PDFDocument({ margin: 50 })

  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'public', 'quotes')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, `quote-${quoteNumber}.pdf`)
  const writeStream = fs.createWriteStream(outputPath)

  // Pipe PDF to writeStream
  doc.pipe(writeStream)

  // Add company logo
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 120 })
  }

  // Add header
  doc
    .fontSize(20)
    .text('Cotización', 50, 150)
    .fontSize(10)
    .text(`Número: ${quoteNumber}`)
    .text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`)
    .moveDown()
    .fontSize(12)
    .text('Construimos confianza, entregamos concreto')
    .moveDown()

  // Add customer info
  doc
    .fontSize(12)
    .text('Información del Cliente:', 50, 250)
    .fontSize(10)
    .text(`Nombre: ${customerName}`)
    .text(`Email: ${customerEmail}`)
    .text(`Teléfono: ${customerPhone}`)
    .moveDown()

  if (notes) {
    doc
      .fontSize(10)
      .text('Notas:')
      .text(notes)
      .moveDown()
  }

  // Add items table
  const tableTop = 350
  doc
    .fontSize(10)
    .text('Producto', 50, tableTop)
    .text('Categoría', 200, tableTop)
    .text('Cantidad', 300, tableTop)
    .text('Precio', 400, tableTop)
    .text('Total', 500, tableTop)

  let currentY = tableTop + 20
  let total = 0

  // Table content
  items.forEach(item => {
    const itemTotal = item.quantity * item.product.price_per_unit

    doc
      .text(item.product.name, 50, currentY)
      .text(item.product.sqlCategory.name, 200, currentY)
      .text(`${item.quantity} ${item.product.unit_measure}`, 300, currentY)
      .text(formatPrice(item.product.price_per_unit), 400, currentY)
      .text(formatPrice(itemTotal), 500, currentY)

    currentY += 20
    total += itemTotal
  })

  // Add total
  doc
    .moveDown()
    .fontSize(12)
    .text(`Total: ${formatPrice(total)}`, { align: 'right' })

  // Add footer
  doc
    .moveDown(2)
    .fontSize(8)
    .text(
      [
        '* Esta cotización es válida por 30 días.',
        '* Los precios incluyen IVA.',
        '* Los productos que requieren programación están sujetos a disponibilidad.',
        '* El costo de envío se cotizará por separado según la ubicación.',
        '* Para más información contacte a ventas@concrecol.com',
      ].join('\n'),
      { align: 'center' }
    )

  // Finalize PDF and wait for it to be written
  await new Promise((resolve) => {
    doc.end()
    writeStream.on('finish', resolve)
  })

  // Return the relative path from public directory
  return `/quotes/quote-${quoteNumber}.pdf`
}
