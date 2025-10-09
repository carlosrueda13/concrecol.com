'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  SelectValue 
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

const cotizacionFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().min(10, 'Número telefónico inválido'),
  empresa: z.string().optional(),
  tipoProyecto: z.string().min(1, 'Seleccione un tipo de proyecto'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  ubicacion: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres'),
  presupuesto: z.string().optional(),
  fechaEstimada: z.string().optional(),
  condiciones: z.boolean().refine(val => val === true, {
    message: 'Debe aceptar las condiciones',
  }),
})

type CotizacionFormData = z.infer<typeof cotizacionFormSchema>

export default function CotizacionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const { 
    register, 
    handleSubmit, 
    reset,
    setValue,
    watch,
    formState: { errors } 
  } = useForm<CotizacionFormData>({
    resolver: zodResolver(cotizacionFormSchema),
    defaultValues: {
      condiciones: false
    }
  })

  const onSubmit = async (data: CotizacionFormData) => {
    setIsSubmitting(true)
    
    try {
      // Simulación de envío de formulario
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cotización ha sido enviada. Te contactaremos a la brevedad.",
      })
      
      reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Intenta nuevamente.",
      })
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
          Completa el formulario a continuación y nuestro equipo te enviará una cotización detallada para tu proyecto.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Información de contacto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input 
                  id="nombre"
                  {...register("nombre")} 
                  placeholder="Tu nombre completo" 
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">{errors.nombre.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input 
                  id="email" 
                  type="email"
                  {...register("email")} 
                  placeholder="ejemplo@correo.com" 
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input 
                  id="telefono" 
                  {...register("telefono")} 
                  placeholder="+57 321 452 5798" 
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm">{errors.telefono.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa (opcional)</Label>
                <Input 
                  id="empresa" 
                  {...register("empresa")} 
                  placeholder="Nombre de la empresa" 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Detalles del proyecto</h2>
            
            <div className="space-y-2">
              <Label htmlFor="tipoProyecto">Tipo de proyecto *</Label>
              <Select 
                onValueChange={(value) => setValue('tipoProyecto', value)} 
                defaultValue=""
              >
                <SelectTrigger id="tipoProyecto">
                  <SelectValue placeholder="Seleccione un tipo de proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Construcción Residencial</SelectItem>
                  <SelectItem value="comercial">Construcción Comercial</SelectItem>
                  <SelectItem value="industrial">Construcción Industrial</SelectItem>
                  <SelectItem value="infraestructura">Infraestructura</SelectItem>
                  <SelectItem value="remodelacion">Remodelación</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoProyecto && (
                <p className="text-red-500 text-sm">{errors.tipoProyecto.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del proyecto *</Label>
              <Textarea 
                id="descripcion" 
                {...register("descripcion")} 
                placeholder="Describe brevemente tu proyecto, incluyendo dimensiones, requisitos específicos, etc." 
                rows={5}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm">{errors.descripcion.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación del proyecto *</Label>
                <Input 
                  id="ubicacion" 
                  {...register("ubicacion")} 
                  placeholder="Ciudad, Departamento" 
                />
                {errors.ubicacion && (
                  <p className="text-red-500 text-sm">{errors.ubicacion.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="presupuesto">Presupuesto estimado (opcional)</Label>
                <Input 
                  id="presupuesto" 
                  {...register("presupuesto")} 
                  placeholder="Ej: $10,000,000" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fechaEstimada">Fecha estimada de inicio (opcional)</Label>
              <Input 
                id="fechaEstimada" 
                type="date"
                {...register("fechaEstimada")} 
              />
            </div>
          </div>
          
          <div className="flex items-start space-x-2 pt-4">
            <Checkbox 
              id="condiciones" 
              checked={watch('condiciones')}
              onCheckedChange={(checked: boolean | 'indeterminate') => {
                setValue('condiciones', checked === true);
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="condiciones"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto que Concrecol utilice mis datos para contactarme y enviarme la cotización solicitada *
              </label>
              {errors.condiciones && (
                <p className="text-red-500 text-xs">{errors.condiciones.message}</p>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#C4D600] text-[#4D4D4D] hover:bg-[#C4D600]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando solicitud..." : "Solicitar cotización"}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Los campos marcados con * son obligatorios.
          </p>
        </form>
      </div>
    </div>
  )
}
