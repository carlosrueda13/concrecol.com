'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { performCartOperation, CartOperation, CartOperationType } from '@/lib/cart'
import { useLoading } from '@/contexts/loading-context'
import { CartItemWithProduct } from '@/lib/types'

type Cart = {
  id: string
  cartId: string
  items: CartItemWithProduct[]
}

interface CartContextType {
  cart: Cart | null
  cartItems: CartItemWithProduct[]
  loading: boolean
  addToCart: (productId: string, quantity: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  hasScheduledProduct: boolean
  cartTotal: number
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

  // Refrescar carrito cuando se monta el componente (útil para navegación)
  useEffect(() => {
    const handleFocus = () => {
      fetchCart()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
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
      const updatedCartData = await performCartOperation(operation)
      
      // Transform the API response to match our cart structure
      const transformedCart = {
        id: updatedCartData.id,
        cartId: updatedCartData.cartId,
        items: updatedCartData.items || []
      }
      
      setCart(transformedCart)
      return transformedCart
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
    try {
      await performOperation({
        operation: 'add',
        productId,
        quantity,
      })
      
      // Refrescar el carrito después de agregar
      await fetchCart()
      
      toast({
        title: 'Producto agregado',
        description: 'El producto se ha agregado al carrito exitosamente',
      })
    } catch (error) {
      console.error('Error in addToCart:', error)
      throw error
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await performOperation({
        operation: 'update',
        productId,
        quantity,
      })
      
      // Refrescar el carrito después de actualizar
      await fetchCart()
      
      toast({
        title: 'Cantidad actualizada',
        description: 'La cantidad del producto se ha actualizado exitosamente',
      })
    } catch (error) {
      console.error('Error in updateQuantity:', error)
      throw error
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      await performOperation({
        operation: 'remove',
        productId,
      })
      
      // Refrescar el carrito después de eliminar
      await fetchCart()
      
      toast({
        title: 'Producto eliminado',
        description: 'El producto se ha eliminado del carrito',
      })
    } catch (error) {
      console.error('Error in removeFromCart:', error)
      throw error
    }
  }

  const hasScheduledProduct = cart?.items.some(
    (item) => item.product.requires_scheduling
  ) ?? false

  // Calcular total del carrito
  const cartTotal = cart?.items.reduce((total, item) => {
    return total + (item.quantity * item.product.price_per_unit)
  }, 0) ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart?.items ?? [],
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        hasScheduledProduct,
        cartTotal,
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
