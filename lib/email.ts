import nodemailer from 'nodemailer'

// Configuración del transporter basado en variables de entorno
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
})

export const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'Concrecol <no-reply@concrecol.com>'
export const SALES_EMAIL = process.env.SALES_EMAIL || 'ventas@concrecol.com'

// Función para enviar un correo electrónico
export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; path: string }[]
}) {
  // En desarrollo, simular envío de email si no hay credenciales configuradas
  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
    console.log('📧 Email simulado:')
    console.log(`Para: ${to}`)
    console.log(`Asunto: ${subject}`)
    console.log('Contenido:', html)
    console.log('Adjuntos:', attachments)
    return { success: true, messageId: 'dev-mode' }
  }

  // Envío de email
  try {
    const info = await transporter.sendMail({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      html,
      attachments,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error al enviar email:', error)
    return { success: false, error }
  }
}
