'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { formatPrice } from '@/lib/utils'
import { UnitMeasure, type Product } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, Loader2, Plus, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define the form schema
const orderFormSchema = z.object({
  customer_name: z.string().min(1, 'El nombre es requerido'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(1, 'El teléfono es requerido'),
  customer_document: z.string().min(1, 'El documento es requerido'),
  delivery_option: z.enum(['pickup', 'delivery']),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().min(1, 'Selecciona un producto'),
      quantity: z.number().min(0.1, 'La cantidad debe ser mayor a 0'),
    })
  ).min(1, 'Debes agregar al menos un producto'),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

interface CreateOrderFormProps {
  products: Product[]
}

export function CreateOrderForm({ products }: CreateOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: OrderFormValues = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_document: '',
    delivery_option: 'pickup',
    delivery_address: '',
    notes: '',
    items: [{ product_id: '', quantity: 1 }],
  }

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
  })

  const watchDeliveryOption = form.watch('delivery_option')
  const watchItems = form.watch('items')
  
  // Calculate order total
  const calculateTotal = () => {
    let total = 0
    let requiresScheduling = false
    
    for (const item of watchItems) {
      if (item.product_id && item.quantity) {
        const product = products.find(p => p.id === item.product_id)
        if (product) {
          total += product.price_per_unit * item.quantity
          if (product.requires_scheduling) {
            requiresScheduling = true
          }
        }
      }
    }
    
    // Add delivery fee if applicable (simplified for demo)
    if (watchDeliveryOption === 'delivery') {
      total += 15000 // Sample delivery fee
    }
    
    return { total, requiresScheduling }
  }

  const { total, requiresScheduling } = calculateTotal()

  const addItem = () => {
    form.setValue('items', [...form.getValues('items'), { product_id: '', quantity: 1 }])
  }

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items')
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index))
    }
  }

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true)
    try {
      // Prepare the order data
      const orderData = {
        ...data,
        order_number: `ORD-${nanoid(8).toUpperCase()}`,
        payment_status: 'pending',
        order_status: 'created',
        created_by_admin: true,
        requires_scheduling: requiresScheduling,
        delivery_fee: watchDeliveryOption === 'delivery' ? 15000 : 0,
        total_amount: total,
        items: data.items.map(item => {
          const product = products.find(p => p.id === item.product_id)!
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: product.price_per_unit,
          }
        }),
      }
      
      // Submit the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Error al crear la orden')
      }

      const { order } = await response.json()
      
      toast.success('Orden creada correctamente')
      router.push(`/admin/ordenes/${order.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la orden')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="text-lg font-medium">Información del Cliente</div>
            
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customer_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento</FormLabel>
                    <FormControl>
                      <Input placeholder="NIT o CC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="delivery_option"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Método de Entrega</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Recoger en tienda</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">Envío a domicilio</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchDeliveryOption === 'delivery' && (
              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Entrega</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ingresa la dirección completa" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instrucciones especiales o comentarios" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Products */}
          <div>
            <div className="text-lg font-medium mb-4">Productos</div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {form.watch('items').map((_, index) => (
                    <div key={index} className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Producto #{index + 1}</div>
                        {index > 0 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.product_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Producto</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? products.find(
                                            (product) => product.id === field.value
                                          )?.name
                                        : "Seleccionar producto..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Buscar producto..." />
                                    <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                    <CommandGroup>
                                      {products.map((product) => (
                                        <CommandItem
                                          value={product.name}
                                          key={product.id}
                                          onSelect={() => {
                                            form.setValue(`items.${index}.product_id`, product.id);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              product.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          <div className="flex-1">
                                            {product.name}
                                            <div className="text-xs text-muted-foreground">
                                              {formatPrice(product.price_per_unit)} / {product.unit_measure}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cantidad</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min="0.1" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.getValues(`items.${index}.product_id`) && (
                          <div className="text-right font-medium">
                            Subtotal: {formatPrice(
                              (products.find(p => p.id === form.getValues(`items.${index}.product_id`))?.price_per_unit || 0) * 
                              (form.getValues(`items.${index}.quantity`) || 0)
                            )}
                          </div>
                        )}
                      </div>
                      {index < form.watch('items').length - 1 && <hr className="my-2" />}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addItem}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 rounded-lg bg-muted p-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal Productos</span>
                <span>{formatPrice(total - (watchDeliveryOption === 'delivery' ? 15000 : 0))}</span>
              </div>
              
              {watchDeliveryOption === 'delivery' && (
                <div className="flex justify-between mb-2">
                  <span>Cargo por Entrega</span>
                  <span>{formatPrice(15000)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              {requiresScheduling && (
                <div className="mt-4 text-amber-600 text-sm">
                  Esta orden incluye productos que requieren programación de entrega.
                </div>
              )}
            </div>
            
            {/* Order Preview */}
            {watchItems.length > 0 && watchItems.some(item => item.product_id && item.quantity) && (
              <div className="mt-6">
                <div className="font-semibold mb-2">Vista Previa de la Orden</div>
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">Cliente</div>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                        <div>Nombre: <span className="text-muted-foreground">{form.watch('customer_name') || 'No especificado'}</span></div>
                        <div>Email: <span className="text-muted-foreground">{form.watch('customer_email') || 'No especificado'}</span></div>
                        <div>Teléfono: <span className="text-muted-foreground">{form.watch('customer_phone') || 'No especificado'}</span></div>
                        <div>Documento: <span className="text-muted-foreground">{form.watch('customer_document') || 'No especificado'}</span></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Entrega</div>
                      <div className="text-sm mt-1">
                        <div>Método: <span className="text-muted-foreground">
                          {watchDeliveryOption === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}
                        </span></div>
                        {watchDeliveryOption === 'delivery' && (
                          <div>Dirección: <span className="text-muted-foreground">{form.watch('delivery_address') || 'No especificada'}</span></div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Productos</div>
                      <div className="text-sm mt-1 space-y-2">
                        {watchItems.map((item, index) => {
                          if (!item.product_id || !item.quantity) return null;
                          const product = products.find(p => p.id === item.product_id);
                          if (!product) return null;
                          
                          return (
                            <div key={index} className="flex justify-between">
                              <div>
                                {product.name} x {item.quantity} {product.unit_measure}
                                {product.requires_scheduling && <span className="ml-2 text-amber-600 text-xs">(Requiere programación)</span>}
                              </div>
                              <div>{formatPrice(product.price_per_unit * item.quantity)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {form.watch('notes') && (
                      <div>
                        <div className="font-medium">Notas</div>
                        <div className="text-sm mt-1 text-muted-foreground">
                          {form.watch('notes')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            disabled={isSubmitting}
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Orden'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
