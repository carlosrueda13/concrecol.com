import { z } from 'zod'
import { LineaNegocio, UnitMeasure } from '@prisma/client'

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
  lineaNegocio: z.nativeEnum(LineaNegocio).nullable().optional(),
  stock_quantity: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  requires_scheduling: z.boolean().default(false),
  images: z.array(z.string().url('URL inválida')).default([]),
  is_active: z.boolean().default(true),
  sqlCategoryId: z.string().min(1, 'Seleccione una categoría'),
  description: z.string().nullable().optional(),
  applications: z.array(z.string()).optional(),
  advantages: z.string().nullable().optional(),
  specifications: z.string().nullable().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

export const productUpdateSchema = productSchema.partial()
