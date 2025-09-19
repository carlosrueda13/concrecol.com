'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getServerCart() {
  const cartId = cookies().get('cartId')?.value
  if (!cartId) return []

  const cart = await prisma.cart.findUnique({
    where: { cartId },
    include: {
      items: {
        include: {
          product: {
            include: {
              sqlCategory: true,
            },
          },
        },
      },
    },
  })

  if (!cart) return []
  return cart.items
}

export async function clearServerCart() {
  const cartId = cookies().get('cartId')?.value
  if (!cartId) return

  // Delete all items in the cart
  await prisma.cart.update({
    where: { cartId },
    data: {
      items: {
        deleteMany: {},
      },
    },
  })

  // Delete the cartId cookie
  cookies().delete('cartId')
}
