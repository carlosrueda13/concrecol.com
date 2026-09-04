'use client'

import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
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
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'

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
  const lineaParam = searchParams.get('linea')

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
    const url = lineaParam
      ? `/api/products?active=true&linea=${encodeURIComponent(lineaParam)}`
      : '/api/products?active=true'
    fetch(url)
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
  }, [lineaParam])

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
    <div>
      <header className="bg-blanco">
        <div className="mx-auto max-w-[1200px] px-4 py-16">
          <h1 className="text-left font-titulo text-[40px] text-grisCon">
            Solicita una cotización
          </h1>
          <div className="mt-4 h-[4px] w-[80px] bg-lima" />
          <p className="mt-4 max-w-3xl text-[18px] text-grisCon opacity-70">
            Completa el formulario a continuación y nuestro equipo te enviará una
            cotización detallada para tu proyecto.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-[1200px] px-4 pt-8">
          {submitSuccess && (
            <Alert className="mb-6 bg-lima text-grisCon">
              <AlertDescription>
                Tu solicitud de cotización fue enviada correctamente. Te
                contactaremos a la brevedad.
              </AlertDescription>
            </Alert>
          )}

          {submitError && (
            <Alert className="mb-6 bg-grisCon text-blanco">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
        </div>

        <Aparece direccion="arriba" distancia={40} duracion={0.6} retraso={0}>
          <section className="bg-blanco">
            <div className="mx-auto max-w-[1200px] px-4 py-16">
              <h2 className="font-titulo text-2xl text-grisCon">PRODUCTO</h2>
              <div className="mt-4 h-[4px] w-[80px] bg-lima" />
              <div className="mt-8 space-y-4">
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
              </div>
            </div>
          </section>
        </Aparece>

        <Aparece direccion="arriba" distancia={40} duracion={0.6} retraso={0.15}>
          <section className="bg-grisClaro">
            <div className="mx-auto max-w-[1200px] px-4 py-16">
              <h2 className="font-titulo text-2xl text-grisCon">OBRA</h2>
              <div className="mt-4 h-[4px] w-[80px] bg-lima" />
              <div className="mt-8 space-y-4">
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
                  <p className="text-xs text-grisCon">
                    Indique el ancho de vía, la pendiente y el espacio de maniobra
                    disponibles para el ingreso de la mezcladora.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Aparece>

        <Aparece direccion="arriba" distancia={40} duracion={0.6} retraso={0.3}>
          <section className="bg-blanco">
            <div className="mx-auto max-w-[1200px] px-4 py-16">
              <h2 className="font-titulo text-2xl text-grisCon">CONTACTO</h2>
              <div className="mt-4 h-[4px] w-[80px] bg-lima" />
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input
                      id="nombre"
                      {...register('nombre')}
                      placeholder="Tu nombre completo"
                    />
                    {errors.nombre && (
                      <p className="text-grisCon text-sm">{errors.nombre.message}</p>
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
                      <p className="text-grisCon text-sm">{errors.telefono.message}</p>
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
                    <p className="text-grisCon text-sm">{errors.email.message}</p>
                  )}
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
                      <p className="text-grisCon text-xs">
                        {errors.autorizacionDatos.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <BotonCotizar
                    type="submit"
                    variant="primaria"
                    className="w-full h-[56px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando solicitud...' : 'Solicitar cotización'}
                  </BotonCotizar>

                  <p className="text-xs text-grisCon text-center mt-4">
                    Los campos marcados con * son obligatorios.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Aparece>
      </form>
    </div>
  )
}

export default function CotizacionPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center text-grisCon">
          Cargando formulario…
        </div>
      }
    >
      <CotizacionForm />
    </Suspense>
  )
}
