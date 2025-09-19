import nodemailer from 'nodemailer'
import { Order, OrderItem } from '@prisma/client'
import { formatPrice } from './utils'
import { OrderWithItems } from '@/types/prisma-extensions'

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  const itemsList = order.items
    .map(
      (item) =>
        `${item.product.name} x ${item.quantity} ${item.product.unit_measure} - ${formatPrice(
          item.unit_price * item.quantity
        )}`
    )
    .join('\n')

  const requiresScheduling = order.requires_scheduling

  const emailBody = `
    <h1>¡Gracias por tu pedido!</h1>
    <p>Hola ${order.customer_name},</p>
    
    <h2>Detalles del Pedido</h2>
    <p>Número de Orden: ${order.order_number}</p>
    <p>Estado: ${getOrderStatus(order.order_status)}</p>
    
    <h3>Productos:</h3>
    <pre>${itemsList}</pre>
    
    <p><strong>Total:</strong> ${formatPrice(order.total_amount)}</p>
    
    ${
      requiresScheduling
        ? `<p style="color: #1d4ed8; padding: 16px; background: #dbeafe; border-radius: 4px;">
           Tu pedido requiere programación. Te contactaremos pronto para coordinar la entrega y el pago.
           </p>`
        : `<p><strong>Estado del Pago:</strong> ${getPaymentStatus(
            order.payment_status
          )}</p>`
    }
    
    ${
      order.delivery_option === 'delivery'
        ? `<p><strong>Dirección de Entrega:</strong><br>${order.delivery_address}</p>
           <p>Te contactaremos para confirmar el costo de envío.</p>`
        : '<p>Has elegido recoger en tienda. Te notificaremos cuando tu pedido esté listo.</p>'
    }
    
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    
    <p>Saludos,<br>Equipo de Concrecol</p>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: order.customer_email,
      subject: `Confirmación de Pedido #${order.order_number}`,
      html: emailBody,
    })
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
}

export async function sendSchedulingRequestEmail(order: OrderWithItems) {
  const salesEmail = process.env.SALES_EMAIL || 'ventas@concrecol.com'
  
  const itemsList = order.items
    .map(
      (item) =>
        `${item.product.name} x ${item.quantity} ${item.product.unit_measure} - ${formatPrice(
          item.unit_price * item.quantity
        )}`
    )
    .join('\n')

  const emailBody = `
    <h1>Nueva Solicitud de Programación</h1>
    
    <h2>Detalles del Cliente</h2>
    <p>Nombre: ${order.customer_name}</p>
    <p>Email: ${order.customer_email}</p>
    <p>Teléfono: ${order.customer_phone}</p>
    <p>Documento: ${order.customer_document}</p>
    
    <h2>Detalles del Pedido</h2>
    <p>Número de Orden: ${order.order_number}</p>
    <p>Estado: ${getOrderStatus(order.order_status)}</p>
    
    <h3>Productos:</h3>
    <pre>${itemsList}</pre>
    
    <p><strong>Total:</strong> ${formatPrice(order.total_amount)}</p>
    
    ${
      order.delivery_option === 'delivery'
        ? `<p><strong>Dirección de Entrega:</strong><br>${order.delivery_address}</p>`
        : '<p>El cliente recogerá en tienda.</p>'
    }
    
    <p style="color: #1d4ed8;">
      <strong>Acción Requerida:</strong> Por favor contacta al cliente para programar la entrega.
    </p>
    
    <p>
      <a href="https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}">
        Abrir chat de WhatsApp
      </a>
    </p>
  `

  try {
    // Send to sales team
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: salesEmail,
      subject: `[URGENTE] Nueva Solicitud de Programación #${order.order_number}`,
      html: emailBody,
    })

    // Send copy to customer
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: order.customer_email,
      subject: `Solicitud de Programación #${order.order_number}`,
      html: `
        <h1>Solicitud de Programación Recibida</h1>
        <p>Hola ${order.customer_name},</p>
        
        <p>Hemos recibido tu solicitud de programación para el pedido #${order.order_number}.</p>
        
        <p>Nuestro equipo de ventas te contactará pronto para coordinar la entrega y el pago.</p>
        
        <h2>Resumen del Pedido</h2>
        <pre>${itemsList}</pre>
        
        <p><strong>Total:</strong> ${formatPrice(order.total_amount)}</p>
        
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        
        <p>Saludos,<br>Equipo de Concrecol</p>
      `,
    })
  } catch (error) {
    console.error('Error sending scheduling request email:', error)
  }
}

export async function sendQuoteEmail(
  customerData: {
    name: string
    email: string
    phone: string
  },
  items: {
    name: string
    quantity: number
    unit_measure: string
    unit_price: number
  }[]
) {
  const salesEmail = process.env.SALES_EMAIL || 'ventas@concrecol.com'
  
  const itemsList = items
    .map(
      (item) =>
        `${item.name} x ${item.quantity} ${item.unit_measure} - ${formatPrice(
          item.unit_price * item.quantity
        )}`
    )
    .join('\n')

  const total = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )

  const emailBody = `
    <h1>Nueva Solicitud de Cotización</h1>
    
    <h2>Detalles del Cliente</h2>
    <p>Nombre: ${customerData.name}</p>
    <p>Email: ${customerData.email}</p>
    <p>Teléfono: ${customerData.phone}</p>
    
    <h2>Productos Solicitados</h2>
    <pre>${itemsList}</pre>
    
    <p><strong>Total Estimado:</strong> ${formatPrice(total)}</p>
    
    <p style="color: #1d4ed8;">
      <strong>Acción Requerida:</strong> Por favor contacta al cliente para enviar la cotización formal.
    </p>
    
    <p>
      <a href="https://wa.me/${customerData.phone.replace(/[^0-9]/g, '')}">
        Abrir chat de WhatsApp
      </a>
    </p>
  `

  try {
    // Send to sales team
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: salesEmail,
      subject: 'Nueva Solicitud de Cotización',
      html: emailBody,
    })

    // Send confirmation to customer
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customerData.email,
      subject: 'Solicitud de Cotización Recibida',
      html: `
        <h1>Solicitud de Cotización Recibida</h1>
        <p>Hola ${customerData.name},</p>
        
        <p>Hemos recibido tu solicitud de cotización para los siguientes productos:</p>
        
        <pre>${itemsList}</pre>
        
        <p>Nuestro equipo de ventas te contactará pronto con una cotización detallada.</p>
        
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        
        <p>Saludos,<br>Equipo de Concrecol</p>
      `,
    })
  } catch (error) {
    console.error('Error sending quote request email:', error)
  }
}

function getOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    created: 'Creado',
    scheduled: 'Programado',
    processing: 'En Proceso',
    ready: 'Listo',
    completed: 'Completado',
    canceled: 'Cancelado',
  }
  return statusMap[status] || status
}

function getPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  }
  return statusMap[status] || status
}
