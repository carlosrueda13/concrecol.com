'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-provider'
import { useToast } from '@/components/ui/use-toast'

interface AddToCartButtonProps {
  productId: string
  quantity: number
  disabled?: boolean
}

export function AddToCartButton({ productId, quantity, disabled }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      if (isNaN(quantity) || quantity <= 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Por favor ingresa una cantidad válida'
        })
        return
      }

      await addToCart(productId, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el producto al carrito'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? 'Agregando...' : 'Agregar al Carrito'}
    </Button>
  )
}
