import { z } from 'zod'
import { UnitMeasure } from '@prisma/client'

export const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
  price_per_unit: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  unit_measure: z.enum([
    UnitMeasure.M3,
    UnitMeasure.KG,
    UnitMeasure.TON,
    UnitMeasure.BOLSA,
    UnitMeasure.GALON
  ], {
    required_error: 'Seleccione una unidad de medida',
  }),
  stock_quantity: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  requires_scheduling: z.boolean().default(false),
  images: z.array(z.string().url('URL inválida')).default([]),
  is_active: z.boolean().default(true),
  sqlCategoryId: z.string().min(1, 'Seleccione una categoría'),
})

export type ProductFormData = z.infer<typeof productSchema>

export const productUpdateSchema = productSchema.partial()
