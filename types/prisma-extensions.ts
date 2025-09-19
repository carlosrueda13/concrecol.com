// Extend the Order type to include SIIGO fields
import { Order, OrderItem, Product } from '@prisma/client'

// Define a complete OrderWithItems type that we can use throughout the application
export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
}

// No need to declare module augmentation since we'll use type assertion instead
export {}
