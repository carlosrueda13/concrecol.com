import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerCart, clearServerCart } from '@/lib/server-cart'

// ✅ Schema de validación mejorado
const cartOperationSchema = z.object({
  operation: z.enum(['add', 'update', 'remove']),
  productId: z.string().uuid('ID de producto inválido'), // ✅ Validar UUID
  quantity: z.number()
    .positive('La cantidad debe ser positiva')
    .max(1000, 'Cantidad máxima excedida')
    .optional(),
}).refine((data) => {
  if ((data.operation === 'add' || data.operation === 'update') && !data.quantity) {
    throw new Error('Quantity is required for add/update operations')
  }
  return true
}, 'Quantity validation failed')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { operation, productId, quantity } = cartOperationSchema.parse(body)

    // Get the product to validate availability
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        is_active: true,
        stock_quantity: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.is_active) {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 })
    }

    // Get or create cart
    const cartCookieId = cookies().get('cartId')?.value
    const cart = cartCookieId 
      ? await getCart(cartCookieId) 
      : await createCart()

    // Set cart cookie if it doesn't exist
    if (!cartCookieId) {
      cookies().set('cartId', cart.cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        path: '/',
      })
    }

    let updatedCart

    switch (operation) {
      case 'add':
      case 'update':
        if (!quantity) {
          return NextResponse.json(
            { error: 'Quantity is required for add/update operations' },
            { status: 400 }
          )
        }

        if (operation === 'add' && product.stock_quantity < quantity) {
          return NextResponse.json(
            { error: 'Insufficient stock' },
            { status: 400 }
          )
        }

        // Check if item exists in cart
        const existingItem = await prisma.cartItem.findUnique({
          where: {
            cart_id_product_id: {
              cart_id: cart.id,
              product_id: productId,
            },
          },
        })

        const newQuantity = operation === 'add' && existingItem
          ? existingItem.quantity + quantity
          : quantity

        if (product.stock_quantity < newQuantity) {
          return NextResponse.json(
            { error: 'Insufficient stock' },
            { status: 400 }
          )
        }

        if (existingItem) {
          // Update quantity
          updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: {
              items: {
                update: {
                  where: {
                    id: existingItem.id,
                  },
                  data: {
                    quantity: newQuantity,
                  },
                },
              },
            },
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
        } else {
          // Add new item
          updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: {
              items: {
                create: {
                  product_id: productId,
                  quantity: quantity,
                },
              },
            },
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
        }
        break

      case 'remove':
        updatedCart = await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: {
              deleteMany: {
                product_id: productId,
              },
            },
          },
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
        break
    }

    return NextResponse.json(updatedCart)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('[CART_OPERATION]', error)
    return NextResponse.json(
      { error: 'Error processing cart operation' },
      { status: 500 }
    )
  }
}

async function getCart(cartId: string) {
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

  if (!cart) {
    return createCart()
  }

  return cart
}

async function createCart() {
  return prisma.cart.create({
    data: {
      cartId: crypto.randomUUID(),
    },
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
}

export async function GET() {
  try {
    const cartItems = await getServerCart()
    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Error fetching cart' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await clearServerCart()
    return NextResponse.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Error clearing cart' }, { status: 500 })
  }
}
