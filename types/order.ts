import { z } from 'zod'

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export interface OrderFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_document: string
  delivery_option: 'pickup' | 'delivery'
  delivery_address?: string
  requires_scheduling: boolean
  delivery_date?: Date
  delivery_time_slot?: string
  notes: string
  items: OrderItem[]
}
