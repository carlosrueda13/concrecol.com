'use client'

export type CartOperationType = 'add' | 'update' | 'remove'

export interface CartOperation {
  operation: CartOperationType
  productId: string
  quantity?: number
}

export async function getCart() {
  const response = await fetch('/api/cart', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error fetching cart')
  }

  return response.json()
}

export async function performCartOperation(operation: CartOperation) {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(operation),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error performing cart operation')
  }

  return response.json()
}

export async function clearCart() {
  const response = await fetch('/api/cart', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error clearing cart')
  }

  return response.json()
}
