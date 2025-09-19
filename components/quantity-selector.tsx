'use client'

import { useState } from 'react'
import { UnitMeasure } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  unitMeasure: UnitMeasure
  maxQuantity: number
  onQuantityChange: (quantity: number) => void
  initialQuantity?: number
}

export default function QuantitySelector({
  unitMeasure,
  maxQuantity,
  onQuantityChange,
  initialQuantity = 1,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity)

  const step = unitMeasure === 'M3' ? 0.5 : 1
  const min = unitMeasure === 'M3' ? 0.5 : 1

  const updateQuantity = (newQuantity: number) => {
    const validQuantity = Math.min(Math.max(newQuantity, min), maxQuantity)
    setQuantity(validQuantity)
    onQuantityChange(validQuantity)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      updateQuantity(value)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateQuantity(quantity - step)}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        step={step}
        min={min}
        max={maxQuantity}
        className="w-24 text-center"
      />

      <Button
        variant="outline"
        size="icon"
        onClick={() => updateQuantity(quantity + step)}
        disabled={quantity >= maxQuantity}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground">
        {unitMeasure.toLowerCase()}
      </span>
    </div>
  )
}
