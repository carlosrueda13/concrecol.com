'use client'

import { useState, useEffect } from 'react'
import { type OrderFormData } from '@/lib/validations/order'
import { orderSchema } from '@/lib/validations/order'
import { OrderItemsTable } from '@/components/order-items-table'
import { type Product } from '@/types/product'
import { useForm, type ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DeliveryCalendar } from '@/components/delivery-calendar'
import { createOrder } from '@/app/actions/order'

export function CreateOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_document: '',
      delivery_option: 'pickup',
      delivery_address: '',
      requires_scheduling: false,
      delivery_date: undefined,
      delivery_time_slot: undefined,
      notes: '',
      items: [],
      payment_status: 'pending',
      order_status: 'created',
    },
  })

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createOrder(data)
      if (result.success) {
        form.reset()
        // Mostrar mensaje de éxito
      } else {
        // Mostrar mensaje de error
      }
    } catch (error) {
      console.error('Error creating order:', error)
      // Mostrar mensaje de error
    } finally {
      setIsSubmitting(false)
    }
  }

  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // Cargar productos activos
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?active=true')
        if (!response.ok) throw new Error('Error loading products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }
    loadProducts()
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="items"
          render={({ field }: { field: ControllerRenderProps<OrderFormData, 'items'> }) => (
            <FormItem>
              <FormLabel>Productos</FormLabel>
              <FormControl>
                <OrderItemsTable
                  products={products}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="customer_name"
            render={({ field }: { field: ControllerRenderProps<OrderFormData, 'customer_name'> }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer_document"
            render={({ field }: { field: ControllerRenderProps<OrderFormData, 'customer_document'> }) => (
              <FormItem>
                <FormLabel>Documento</FormLabel>
                <FormControl>
                  <Input placeholder="CC/NIT 123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer_email"
            render={({ field }: { field: ControllerRenderProps<OrderFormData, 'customer_email'> }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="juan@ejemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer_phone"
            render={({ field }: { field: ControllerRenderProps<OrderFormData, 'customer_phone'> }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+57 321 452 5798" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="delivery_option"
            render={({ field }: { field: ControllerRenderProps<OrderFormData, 'delivery_option'> }) => (
              <FormItem>
                <FormLabel>Opción de entrega</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pickup">Recoger en tienda</SelectItem>
                    <SelectItem value="delivery">Entrega a domicilio</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('delivery_option') === 'delivery' && (
            <FormField
              control={form.control}
              name="delivery_address"
              render={({ field }: { field: ControllerRenderProps<OrderFormData, 'delivery_address'> }) => (
                <FormItem>
                  <FormLabel>Dirección de entrega</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: KM 8 Via San gil - Socorro, Santander"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="requires_scheduling"
            render={({ field }: { field: ControllerRenderProps<OrderFormData, 'requires_scheduling'> }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel>Requiere programación de entrega</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('requires_scheduling') && (
            <DeliveryCalendar
              onDateSelect={(date) =>
                form.setValue('delivery_date', date, { shouldValidate: true })
              }
              onTimeSelect={(time) =>
                form.setValue('delivery_time_slot', time, { shouldValidate: true })
              }
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: ControllerRenderProps<OrderFormData, 'notes'> }) => (
            <FormItem>
              <FormLabel>Notas adicionales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instrucciones especiales, comentarios o requisitos"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando pedido...' : 'Crear pedido'}
        </Button>
      </form>
    </Form>
  )
}
