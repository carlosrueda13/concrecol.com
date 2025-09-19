import { formatPrice } from "@/lib/utils"
import { CartItem } from "@prisma/client"

interface QuoteEmailParams {
  customerName: string
  customerEmail: string
  customerPhone: string
  notes?: string
  items: any[]
  quoteNumber: string
  subtotal: number
  pdfPath: string
}

export function generateQuoteClientEmailHtml({
  customerName,
  quoteNumber,
  subtotal,
  pdfPath,
}: QuoteEmailParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const pdfUrl = `${baseUrl}${pdfPath}`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Tu Cotización de Concrecol</h2>
        </div>
        
        <p>Estimado/a ${customerName},</p>
        
        <p>Gracias por solicitar una cotización con Concrecol. Adjunto encontrarás el detalle 
        de los productos que has seleccionado, con un valor total de ${formatPrice(subtotal)}.</p>
        
        <p>Tu número de cotización es: <strong>${quoteNumber}</strong></p>
        
        <p>Puedes consultar o descargar tu cotización en formato PDF 
        <a href="${pdfUrl}" target="_blank">haciendo clic aquí</a>.</p>
        
        <p>Esta cotización es válida por 30 días. Si tienes alguna pregunta o necesitas 
        más información, no dudes en contactarnos.</p>
        
        <p>Saludos cordiales,<br>
        El Equipo de Concrecol</p>
        
        <div class="footer">
          <p>"Construimos confianza, entregamos concreto"</p>
          <p>© ${new Date().getFullYear()} Concrecol S.A.S. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateQuoteSalesEmailHtml({
  customerName,
  customerEmail,
  customerPhone,
  notes,
  items,
  quoteNumber,
  subtotal,
  pdfPath,
}: QuoteEmailParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const pdfUrl = `${baseUrl}${pdfPath}`
  
  // Crear tabla HTML de productos
  const productsTable = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Producto</th>
          <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Categoría</th>
          <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Cantidad</th>
          <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Precio Unit.</th>
          <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${item.product.name}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${item.product.sqlCategory.name}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${item.quantity} ${item.product.unit_measure}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.product.price_per_unit)}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.quantity * item.product.price_per_unit)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;"><strong>Total</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;"><strong>${formatPrice(subtotal)}</strong></td>
        </tr>
      </tfoot>
    </table>
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { margin-bottom: 20px; }
        .customer-info { margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nueva Solicitud de Cotización</h2>
        </div>
        
        <div class="customer-info">
          <h3>Información del Cliente:</h3>
          <p><strong>Nombre:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Teléfono:</strong> ${customerPhone}</p>
          ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
        </div>
        
        <h3>Cotización #${quoteNumber}</h3>
        
        ${productsTable}
        
        <p style="margin-top: 20px;">
          <a href="${pdfUrl}" style="background-color: #C4D600; color: #4D4D4D; padding: 10px 15px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Ver PDF de Cotización
          </a>
        </p>
        
        <p style="margin-top: 20px;">
          <a href="mailto:${customerEmail}" style="color: #4D4D4D; text-decoration: underline;">
            Responder al cliente
          </a>
        </p>
        
        <div class="footer">
          <p>Este es un correo automático enviado desde el sistema de cotizaciones de Concrecol.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
