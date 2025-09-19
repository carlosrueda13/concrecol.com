export type UnitMeasure = 'KG' | 'UNIT' | 'BOX' | 'TON'

export interface Product {
  id: string
  name: string
  slug: string
  price_per_unit: number
  unit_measure: UnitMeasure
  stock_quantity: number
  requires_scheduling: boolean
  images: string[]
  is_active: boolean
  sqlCategoryId: string
  createdAt: Date
  updatedAt: Date
}
