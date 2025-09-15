import * as z from 'zod'

export const categorySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
  is_active: z.boolean().default(true),
})

export type CategoryFormData = z.infer<typeof categorySchema>
