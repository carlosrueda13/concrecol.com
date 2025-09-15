'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UnitMeasure } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { createProduct, updateProduct } from '@/app/actions/product'

interface ProductFormProps {
  categories: {
    id: string
    name: string
  }[]
  initialData?: Partial<ProductFormData>
  productId?: string
}

export function ProductForm({ categories, initialData, productId }: ProductFormProps) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...initialData,
      price_per_unit: initialData?.price_per_unit || 0,
      stock_quantity: initialData?.stock_quantity || 0,
      requires_scheduling: initialData?.requires_scheduling || false,
      is_active: initialData?.is_active || true,
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (productId) {
        const result = await updateProduct(productId, data)
        if (result.success) {
          toast({
            title: 'Producto actualizado',
            description: 'El producto se ha actualizado correctamente.',
          })
        } else {
          throw new Error(result.error)
        }
      } else {
        const result = await createProduct(data)
        if (result.success) {
          toast({
            title: 'Producto creado',
            description: 'El producto se ha creado correctamente.',
          })
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar el producto',
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
          <Label htmlFor="imageUrl">URL de la imagen</Label>
          <div className="flex space-x-2">
            <Input
              id="imageUrl"
              placeholder="https://ejemplo.com/imagen.jpg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const input = e.target as HTMLInputElement
                  const currentImages = watch('images') || []
                  if (input.value && currentImages.length < 5) {
                    setValue('images', [...currentImages, input.value])
                    input.value = ''
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const input = document.getElementById('imageUrl') as HTMLInputElement
                const currentImages = watch('images') || []
                if (input.value && currentImages.length < 5) {
                  setValue('images', [...currentImages, input.value])
                  input.value = ''
                }
              }}
            >
              Agregar
            </Button>
          </div>
          <div className="grid gap-2 mt-2">
            {watch('images')?.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm truncate text-blue-500 hover:underline">
                  {url}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const currentImages = watch('images') || []
                    setValue('images', currentImages.filter((_, i) => i !== index))
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          {errors.images && (
            <p className="text-sm text-red-500">{errors.images.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register('slug')} />
          {errors.slug && (
            <p className="text-sm text-red-500">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_per_unit">Precio por unidad</Label>
          <Input
            id="price_per_unit"
            type="number"
            {...register('price_per_unit', { valueAsNumber: true })}
          />
          {errors.price_per_unit && (
            <p className="text-sm text-red-500">
              {errors.price_per_unit.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_measure">Unidad de medida</Label>
          <Select
            onValueChange={(value) =>
              setValue('unit_measure', value as UnitMeasure)
            }
            defaultValue={watch('unit_measure')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UnitMeasure.M3}>Metro cúbico (m³)</SelectItem>
              <SelectItem value={UnitMeasure.KG}>Kilogramo (kg)</SelectItem>
              <SelectItem value={UnitMeasure.TON}>Tonelada</SelectItem>
              <SelectItem value={UnitMeasure.BOLSA}>Bolsa</SelectItem>
              <SelectItem value={UnitMeasure.GALON}>Galón</SelectItem>
            </SelectContent>
          </Select>
          {errors.unit_measure && (
            <p className="text-sm text-red-500">
              {errors.unit_measure.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stock</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register('stock_quantity', { valueAsNumber: true })}
          />
          {errors.stock_quantity && (
            <p className="text-sm text-red-500">
              {errors.stock_quantity.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sqlCategoryId">Categoría</Label>
          <Select
            onValueChange={(value) => setValue('sqlCategoryId', value)}
            defaultValue={watch('sqlCategoryId')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sqlCategoryId && (
            <p className="text-sm text-red-500">
              {errors.sqlCategoryId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="requires_scheduling"
          checked={watch('requires_scheduling')}
          onCheckedChange={(checked) =>
            setValue('requires_scheduling', checked)
          }
        />
        <Label htmlFor="requires_scheduling">Requiere programación</Label>
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
          : productId
          ? 'Actualizar Producto'
          : 'Crear Producto'}
      </Button>
    </form>
  )
}
