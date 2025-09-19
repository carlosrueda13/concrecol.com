'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { CartItemWithProduct } from '@/lib/types'
import { checkoutFormSchema, type CheckoutFormData } from '@/lib/validations/checkout'
import { formatPrice } from '@/lib/utils'
import { StripePaymentForm } from '@/components/stripe-payment-form'
import { clearCart } from '@/lib/cart'
import { useLoading } from '@/contexts/loading-context'

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface CheckoutFormProps {
  cartItems: CartItemWithProduct[]
  hasScheduledProduct: boolean
}

export function CheckoutForm({ cartItems, hasScheduledProduct }: CheckoutFormProps) {
  const { toast } = useToast()
  const { startLoading, stopLoading, setLoadingMessage } = useLoading()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse' | 'transfer'>('card')
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')
  const [clientSecret, setClientSecret] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      document_type: 'CC', // Establece un valor predeterminado para document_type
    }
  })

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price_per_unit * item.quantity,
    0
  )
  
  // Asegurarse de que el tipo de documento tenga un valor por defecto desde el inicio
  useEffect(() => {
    if (!watch('document_type')) {
      setValue('document_type', 'CC', { shouldValidate: false });
    }
  }, [setValue, watch]);

  const onSubmit = async (data: CheckoutFormData) => {
    // Mostrar datos del formulario en consola para diagnóstico
    console.log('Datos del formulario:', data)
    
    setLoading(true)
    
    let message = 'Procesando pedido...'
    if (hasScheduledProduct) {
      message = 'Programando entrega...'
    } else if (paymentMethod === 'transfer') {
      message = 'Registrando pedido para transferencia...'
    } else if (paymentMethod === 'pse') {
      message = 'Preparando pago PSE...'
    } else {
      message = 'Procesando pago con tarjeta...'
    }
    
    setLoadingMessage(message)
    startLoading()
    
    try {
      // If order requires scheduling, create order without payment
      if (hasScheduledProduct) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            delivery_option: deliveryOption,
            items: cartItems,
            requires_scheduling: true,
            payment_status: 'pending',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error creating order');
        }

        const result = await response.json()

        toast({
          title: 'Pedido creado',
          description:
            'Te contactaremos pronto para coordinar la entrega y el pago.',
        })

        // Clear cart and redirect to confirmation
        await clearCart();
        window.location.href = `/pedidos/${result.order.id}/confirmacion`
        return
      }

      // For non-scheduled orders, create payment intent
      if (paymentMethod === 'transfer') {
        // Handle offline transfer payment
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            delivery_option: deliveryOption,
            items: cartItems,
            payment_method: 'transfer',
            payment_status: 'pending',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error creating order');
        }

        const result = await response.json()

        toast({
          title: 'Pedido creado',
          description:
            'Te enviaremos las instrucciones de pago por correo electrónico.',
        })

        await clearCart();
        window.location.href = `/pedidos/${result.order.id}/confirmacion`
      } else {
        // Handle Stripe payment (card/PSE)
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            delivery_option: deliveryOption,
            items: cartItems,
            payment_method: paymentMethod,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error creating payment intent');
        }

        const { clientSecret } = await response.json()
        setClientSecret(clientSecret)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al procesar el pedido',
      })
    } finally {
      setLoading(false)
      stopLoading()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información del Cliente</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nombre Completo</Label>
            <Input
              id="customer_name"
              {...register('customer_name')}
              placeholder="Juan Pérez"
            />
            {errors.customer_name && (
              <p className="text-sm text-red-500">
                {errors.customer_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">Correo Electrónico</Label>
            <Input
              id="customer_email"
              type="email"
              {...register('customer_email')}
              placeholder="juan@ejemplo.com"
            />
            {errors.customer_email && (
              <p className="text-sm text-red-500">
                {errors.customer_email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Teléfono</Label>
            <Input
              id="customer_phone"
              {...register('customer_phone')}
              placeholder="+57 300 123 4567"
            />
            {errors.customer_phone && (
              <p className="text-sm text-red-500">
                {errors.customer_phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_document">Documento de Identidad</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                defaultValue="CC"
                onValueChange={(value) => {
                  setValue('document_type', value as 'CC' | 'NIT' | 'CE' | 'PP', {
                    shouldValidate: true
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">CC</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="PP">PP</SelectItem>
                </SelectContent>
              </Select>
              <div className="col-span-2">
                <Input
                  id="document_number"
                  {...register('document_number')}
                  placeholder="Número"
                />
              </div>
            </div>
            {errors.document_type && (
              <p className="text-sm text-red-500">
                {errors.document_type.message}
              </p>
            )}
            {errors.document_number && (
              <p className="text-sm text-red-500">
                {errors.document_number.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Método de Entrega</h3>
        <RadioGroup
          value={deliveryOption}
          onValueChange={(value) =>
            setDeliveryOption(value as 'pickup' | 'delivery')
          }
          className="grid gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup">Recoger en tienda (gratis)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery">Envío a domicilio</Label>
          </div>
        </RadioGroup>

        {deliveryOption === 'delivery' && (
          <div className="space-y-2">
            <Label htmlFor="delivery_address">Dirección de Entrega</Label>
            <Input
              id="delivery_address"
              {...register('delivery_address')}
              placeholder="Calle 123 #45-67, Ciudad"
            />
            {errors.delivery_address && (
              <p className="text-sm text-red-500">
                {errors.delivery_address.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Costo adicional, te contactaremos para confirmar el valor.
            </p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {item.product.name} x {item.quantity} {item.product.unit_measure}
              </span>
              <span>
                {formatPrice(item.product.price_per_unit * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      {!hasScheduledProduct && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Método de Pago</h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as 'card' | 'pse' | 'transfer')
            }
            className="grid gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card">Tarjeta de Crédito o Débito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pse" id="pse" />
              <Label htmlFor="pse">PSE</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer">
                Transferencia Bancaria (offline)
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod !== 'transfer' && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: 'stripe' },
              }}
            >
              <StripePaymentForm />
            </Elements>
          )}
        </div>
      )}

      {hasScheduledProduct ? (
        <div className="rounded-lg bg-blue-50 p-4 space-y-2">
          <p className="font-semibold text-blue-800">
            Tu pedido requiere programación
          </p>
          <p className="text-sm text-blue-700">
            Te contactaremos para coordinar la entrega y el pago.
          </p>
        </div>
      ) : (
        paymentMethod === 'transfer' && (
          <div className="rounded-lg bg-yellow-50 p-4 space-y-2">
            <p className="font-semibold text-yellow-800">
              Pago por Transferencia
            </p>
            <p className="text-sm text-yellow-700">
              Confirmaremos tu pago por transferencia y te enviaremos la
              factura electrónica.
            </p>
          </div>
        )
      )}

      {paymentMethod !== 'transfer' && clientSecret ? null : (
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? 'Procesando...'
            : hasScheduledProduct
            ? 'Solicitar Programación'
            : 'Finalizar Compra'}
        </Button>
      )}
    </form>
  )
}
