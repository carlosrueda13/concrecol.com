import { Cart, CartItem, Product, SqlCategory } from '@prisma/client'

export type CartItemWithProduct = CartItem & {
  product: Product & {
    sqlCategory: SqlCategory
  }
}

export type CartWithItems = Cart & {
  items: CartItemWithProduct[]
}
