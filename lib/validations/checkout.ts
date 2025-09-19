import { z } from 'zod'

export const checkoutFormSchema = z.object({
  customer_name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100),
  customer_email: z.string().email('Correo electrónico inválido'),
  customer_phone: z
    .string()
    .min(10, 'Teléfono inválido')
    .max(15)
    .regex(/^\+?[\d\s-]+$/, 'Teléfono inválido'),
  document_type: z.enum(['CC', 'NIT', 'CE', 'PP'], {
    required_error: 'Debe seleccionar un tipo de documento',
    invalid_type_error: 'Tipo de documento inválido',
  }),
  document_number: z
    .string()
    .min(4, 'El número de documento debe tener al menos 4 caracteres')
    .max(20)
    .regex(/^[\d\-\.]+$/, 'El número de documento solo debe contener números, puntos o guiones'),
  delivery_address: z.string().optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
