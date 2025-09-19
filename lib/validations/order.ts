import { z } from 'zod'

export const orderDeliverySchema = z.object({
  delivery_option: z.enum(['pickup', 'delivery']),
  delivery_address: z.string().optional().nullable(),
  delivery_date: z.date().optional().nullable(),
  delivery_time_slot: z.string().optional().nullable(),
  requires_scheduling: z.boolean().default(false),
})

export const orderCustomerSchema = z.object({
  customer_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  customer_document: z.string().min(6, 'El documento debe tener al menos 6 caracteres'),
})

export const orderItemSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unit_price: z.number().nonnegative('El precio debe ser mayor o igual a 0'),
  total: z.number().nonnegative('El total debe ser mayor o igual a 0'),
})

export const orderSchema = z.object({
  ...orderCustomerSchema.shape,
  ...orderDeliverySchema.shape,
  items: z.array(orderItemSchema).min(1, 'Debe agregar al menos un producto'),
  notes: z.string().optional().nullable(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  order_status: z.enum(['created', 'scheduled', 'processing', 'ready', 'completed', 'canceled']).default('created'),
})

export type OrderFormData = z.infer<typeof orderSchema>
export type OrderDeliveryData = z.infer<typeof orderDeliverySchema>
export type OrderCustomerData = z.infer<typeof orderCustomerSchema>
export type OrderItemData = z.infer<typeof orderItemSchema>
