'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useLoading } from '@/contexts/loading-context'

// Esquema de validación para el formulario
const contactFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().min(10, 'Número telefónico inválido'),
  asunto: z.string().min(3, 'El asunto debe tener al menos 3 caracteres'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export default function ContactoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { startLoading, stopLoading, setLoadingMessage } = useLoading()
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setLoadingMessage('Enviando mensaje...')
    startLoading()
    
    // Aquí normalmente enviarías los datos a una API
    try {
      // Simulación de envío de formulario
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos a la brevedad.",
      })
      
      reset() // Limpiar formulario después del éxito
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al enviar tu mensaje. Intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
      stopLoading()
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Contacto
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Estamos aquí para responder tus preguntas y ayudarte con tus proyectos de construcción.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Información de Contacto */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Información de Contacto
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-[#C4D600]/20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4D4D4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dirección</h3>
                <p className="text-gray-600">Calle 123 #45-67, Bogotá, Colombia</p>
                <p className="text-gray-600 mt-1">Horario: Lunes - Viernes, 8:00 AM - 5:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-[#C4D600]/20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4D4D4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Teléfonos</h3>
                <p className="text-gray-600">Ventas: +57 (601) 123-4567</p>
                <p className="text-gray-600">Servicio al cliente: +57 (601) 123-4568</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-[#C4D600]/20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4D4D4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Correo Electrónico</h3>
                <p className="text-gray-600">Ventas: ventas@concrecol.com</p>
                <p className="text-gray-600">Soporte: info@concrecol.com</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Síguenos en Redes Sociales
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-[#C4D600]/20 transition-colors">
                <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-[#C4D600]/20 transition-colors">
                <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-[#C4D600]/20 transition-colors">
                <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-[#C4D600]/20 transition-colors">
                <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.335 18.339H15.67v-4.177c0-1.003.02-2.291-1.381-2.291-1.382 0-1.594 1.091-1.594 2.217v4.251H9.995V9.75h2.561v1.17h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v3.77zM6.839 8.594a1.54 1.54 0 01-1.539-1.538 1.54 1.54 0 011.539-1.538 1.538 1.538 0 010 3.076zm1.33 9.745H5.5V9.75h2.669v8.589zM19.17 3H4.83C3.819 3 3 3.82 3 4.83v14.34c0 1.01.819 1.83 1.83 1.83h14.34c1.01 0 1.83-.82 1.83-1.83V4.83c0-1.01-.82-1.83-1.83-1.83z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Formulario */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Envíanos un mensaje
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
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
                <Label htmlFor="email">Correo electrónico</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input 
                id="telefono" 
                {...register("telefono")} 
                placeholder="+57 300 123 4567" 
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm">{errors.telefono.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="asunto">Asunto</Label>
              <Input 
                id="asunto" 
                {...register("asunto")} 
                placeholder="¿En qué podemos ayudarte?" 
              />
              {errors.asunto && (
                <p className="text-red-500 text-sm">{errors.asunto.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea 
                id="mensaje" 
                {...register("mensaje")} 
                placeholder="Escribe tu mensaje aquí" 
                rows={5}
              />
              {errors.mensaje && (
                <p className="text-red-500 text-sm">{errors.mensaje.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#C4D600] text-[#4D4D4D] hover:bg-[#C4D600]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </form>
        </div>
      </div>

      {/* Mapa */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Encuéntranos
        </h2>
        <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
          Aquí iría un mapa de Google Maps
        </div>
      </div>
    </div>
  )
}
