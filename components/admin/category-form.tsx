'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { categorySchema, type CategoryFormData } from '@/lib/validations/category'
import { createCategory, updateCategory } from '@/app/actions/category'

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>
  categoryId?: string
}

export function CategoryForm({ initialData, categoryId }: CategoryFormProps) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      ...initialData,
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (categoryId) {
        const result = await updateCategory(categoryId, data)
        if (result.success) {
          toast({
            title: 'Categoría actualizada',
            description: 'La categoría se ha actualizado correctamente.',
          })
        } else {
          throw new Error(result.error)
        }
      } else {
        const result = await createCategory(data)
        if (result.success) {
          toast({
            title: 'Categoría creada',
            description: 'La categoría se ha creado correctamente.',
          })
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar la categoría',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register('slug')} />
          {errors.slug && (
            <p className="text-sm text-red-500">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={watch('is_active')}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Activo</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? 'Guardando...'
          : categoryId
          ? 'Actualizar Categoría'
          : 'Crear Categoría'}
      </Button>
    </form>
  )
}
