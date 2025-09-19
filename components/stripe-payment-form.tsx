'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useLoading } from '@/contexts/loading-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function StripePaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const { startLoading, stopLoading, setLoadingMessage } = useLoading()
  const [loading, setLoading] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)
  const formRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hacer auto-scroll hacia el formulario de pago cuando se monte
    if (formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [])
  
  // Registrar evento cuando se carga el componente de pago
  useEffect(() => {
    if (stripe && elements) {
      console.log('Stripe y elementos listos para procesar pagos')
    }
  }, [stripe, elements])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setLoadingMessage('Procesando pago con tarjeta...')
    startLoading()

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmacion`,
        },
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error de pago',
          description:
            error.message || 'Hubo un error al procesar el pago',
        })
      } else {
        // Si llegamos aquí, no hubo error pero tampoco redirección
        // Esto significa que el pago está en proceso (como requiere 3D Secure)
        setProcessingComplete(true)
        toast({
          title: 'Procesando pago',
          description: 'Tu pago está siendo procesado. No cierres esta ventana.'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de pago',
        description: 'Hubo un problema al procesar tu pago. Por favor intenta nuevamente.'
      })
    } finally {
      setLoading(false)
      stopLoading()
    }
  }

  return (
    <div ref={formRef} className="mt-6 border p-6 rounded-lg bg-slate-50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-semibold mb-4">Completa tu pago con tarjeta</h3>
      
      {processingComplete ? (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu pago está siendo procesado. Por favor espera mientras completamos la transacción.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span>Pago seguro con Stripe. Tus datos están protegidos.</span>
          </div>
          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {loading ? 'Procesando...' : 'Completar pago ahora'}
          </Button>
        </form>
      )}
    </div>
  )
}
