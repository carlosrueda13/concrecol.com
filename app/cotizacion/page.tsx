'use client'

import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProductoActivo {
  id: string
  name: string
  slug: string
  is_active: boolean
}

const cotizacionFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  telefono: z.string().min(10, 'Número telefónico inválido'),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  producto: z.string().optional(),
  tipoResistencia: z.string().optional(),
  cantidad: z.string().optional(),
  fechaRequerida: z.string().optional(),
  usoPrevisto: z.string().optional(),
  direccionObra: z.string().optional(),
  condicionesAcceso: z.string().optional(),
  autorizacionDatos: z.boolean().refine((val) => val === true, {
    message: 'Debe autorizar el uso de sus datos',
  }),
})

type CotizacionFormData = z.infer<typeof cotizacionFormSchema>

function CotizacionForm() {
  const searchParams = useSearchParams()
  const productoParam = searchParams.get('producto')

  const [productos, setProductos] = useState<ProductoActivo[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CotizacionFormData>({
    resolver: zodResolver(cotizacionFormSchema),
    defaultValues: {
      autorizacionDatos: false,
    },
  })

  useEffect(() => {
    let cancelled = false
    fetch('/api/products?active=true')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar productos')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setProductos(
            Array.isArray(data) ? data.filter((p: ProductoActivo) => p.is_active) : []
          )
        }
      })
      .catch(() => {
        if (!cancelled) setProductos([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Preseleccionar el producto si ?producto=slug coincide con uno activo
  useEffect(() => {
    if (!productoParam || productos.length === 0) return
    const match = productos.find((p) => p.slug === productoParam)
    if (match) {
      setValue('producto', match.slug)
    }
  }, [productoParam, productos, setValue])

  const onSubmit = async (data: CotizacionFormData) => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    setSubmitError(null)

    try {
      const res = await fetch('/api/cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result?.message || 'Error al enviar la solicitud')
      }

      setSubmitSuccess(true)
      reset()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Hubo un problema al enviar tu solicitud. Intenta nuevamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Solicita una cotización
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Completa el formulario a continuación y nuestro equipo te enviará una
          cotización detallada para tu proyecto.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        {submitSuccess && (
          <Alert className="mb-6 border-green-600 bg-green-50 text-green-800">
            <AlertDescription>
              Tu solicitud de cotización fue enviada correctamente. Te
              contactaremos a la brevedad.
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Información de contacto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  {...register('nombre')}
                  placeholder="Tu nombre completo"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  {...register('telefono')}
                  placeholder="+57 321 452 5798"
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm">{errors.telefono.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico (opcional)</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles del proyecto
            </h2>

            <div className="space-y-2">
              <Label htmlFor="producto">Producto de interés (opcional)</Label>
              <Select
                value={watch('producto') ?? ''}
                onValueChange={(value) => setValue('producto', value, { shouldValidate: true })}
              >
                <SelectTrigger id="producto">
                  <SelectValue placeholder="Seleccione un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.slug}>
                      {producto.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoResistencia">Tipo o resistencia</Label>
              <Input
                id="tipoResistencia"
                list="tipo-resistencia-sugerencias"
                {...register('tipoResistencia')}
                placeholder="Ej: 3000 psi"
              />
              <datalist id="tipo-resistencia-sugerencias">
                <option value="2000 psi" />
                <option value="3000 psi" />
                <option value="MR" />
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad aproximada</Label>
              <Input
                id="cantidad"
                {...register('cantidad')}
                placeholder="Ej: 5 m³"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaRequerida">Fecha en que lo necesita</Label>
              <Input id="fechaRequerida" type="date" {...register('fechaRequerida')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usoPrevisto">Uso previsto</Label>
              <Input
                id="usoPrevisto"
                {...register('usoPrevisto')}
                placeholder="Ej: placa de cimentación, columnas, viga"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccionObra">Dirección / referencias</Label>
              <Input
                id="direccionObra"
                {...register('direccionObra')}
                placeholder="Ciudad, barrio, referencias de la obra"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condicionesAcceso">Condiciones de acceso</Label>
              <Textarea
                id="condicionesAcceso"
                {...register('condicionesAcceso')}
                placeholder="Describe cómo puede ingresar la mezcladora a tu obra"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Indique el ancho de vía, la pendiente y el espacio de maniobra
                disponibles para el ingreso de la mezcladora.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-4">
            <Checkbox
              id="autorizacionDatos"
              checked={watch('autorizacionDatos')}
              onCheckedChange={(checked: boolean | 'indeterminate') => {
                setValue('autorizacionDatos', checked === true)
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="autorizacionDatos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Autorizo a Concrecol el uso de mis datos para contactarme y
                enviarme la cotización solicitada *
              </label>
              {errors.autorizacionDatos && (
                <p className="text-red-500 text-xs">
                  {errors.autorizacionDatos.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#C4D600] text-[#4D4D4D] hover:bg-[#C4D600]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando solicitud...' : 'Solicitar cotización'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Los campos marcados con * son obligatorios.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function CotizacionPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center text-gray-500">
          Cargando formulario…
        </div>
      }
    >
      <CotizacionForm />
    </Suspense>
  )
}
