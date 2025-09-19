'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useCart } from '@/contexts/cart-provider'

interface AddToCartButtonProps {
  productId: string
  disabled?: boolean
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const quantityInput = document.querySelector('input[type="number"]') as HTMLInputElement
      const quantity = parseFloat(quantityInput.value)

      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Por favor ingresa una cantidad válida')
      }

      await addToCart(productId, quantity)
    } catch (error) {
      // Error is handled by CartProvider
      console.error('Error adding to cart:', error)
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
