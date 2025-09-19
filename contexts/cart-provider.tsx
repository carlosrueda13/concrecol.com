'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { performCartOperation, CartOperation, CartOperationType } from '@/lib/cart'
import { useLoading } from '@/contexts/loading-context'

// Define types
export type CartItem = {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  product: {
    id: string
    name: string
    price_per_unit: number
    unit_measure: string
    requires_scheduling: boolean
    images: string[]
    sqlCategory: {
      id: string
      name: string
    }
  }
}

type Cart = {
  id: string
  cartId: string
  items: CartItem[]
}

interface CartContextType {
  cart: Cart | null
  loading: boolean
  addToCart: (productId: string, quantity: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  hasScheduledProduct: boolean
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Create provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { startLoading, stopLoading, setLoadingMessage } = useLoading()

  // Load initial cart state
  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      if (!response.ok) throw new Error('Error fetching cart')
      const items = await response.json()
      // Formato correcto para el estado del cart
      setCart(items.length > 0 ? { 
        id: items[0]?.cart_id || '', 
        cartId: items[0]?.cart_id || '',
        items: items
      } : { id: '', cartId: '', items: [] })
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el carrito',
      })
    }
  }

  const performOperation = async (operation: CartOperation) => {
    setLoading(true)
    
    // Set appropriate loading message based on the operation
    let message = 'Actualizando carrito...';
    if (operation.operation === 'add') {
      message = 'Agregando al carrito...';
    } else if (operation.operation === 'remove') {
      message = 'Eliminando del carrito...';
    } else if (operation.operation === 'update') {
      message = 'Actualizando cantidad...';
    }
    
    setLoadingMessage(message);
    startLoading();
    
    try {
      const updatedCart = await performCartOperation(operation)
      setCart(updatedCart)
      return updatedCart
    } catch (error) {
      console.error('Cart operation error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error en la operación del carrito',
      })
      throw error
    } finally {
      setLoading(false)
      stopLoading()
    }
  }

  const addToCart = async (productId: string, quantity: number) => {
    await performOperation({
      operation: 'add',
      productId,
      quantity,
    })
    toast({
      title: 'Producto agregado',
      description: 'El producto se ha agregado al carrito',
    })
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    await performOperation({
      operation: 'update',
      productId,
      quantity,
    })
  }

  const removeFromCart = async (productId: string) => {
    await performOperation({
      operation: 'remove',
      productId,
    })
    toast({
      title: 'Producto eliminado',
      description: 'El producto se ha eliminado del carrito',
    })
  }

  const hasScheduledProduct = cart?.items.some(
    (item) => item.product.requires_scheduling
  ) ?? false

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        hasScheduledProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Create hook for using cart context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
