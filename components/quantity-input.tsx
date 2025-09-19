'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface QuantityInputProps {
  id: string
  min: number
  max: number
  step: number
  defaultValue: number
  onChange?: (value: number) => void
}

export function QuantityInput({
  id,
  min,
  max,
  step,
  defaultValue,
  onChange,
}: QuantityInputProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (newValue: number) => {
    // Ensure the value is within bounds and properly rounded to step
    const roundedValue = Math.round(newValue / step) * step
    const clampedValue = Math.min(Math.max(roundedValue, min), max)
    
    setValue(clampedValue)
    onChange?.(clampedValue)
  }

  const increment = () => {
    handleChange(value + step)
  }

  const decrement = () => {
    handleChange(value - step)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      handleChange(newValue)
    }
  }

  return (
    <div className="flex w-full max-w-[200px] items-center space-x-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={decrement}
        disabled={value <= min}
      >
        -
      </Button>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="text-center"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={increment}
        disabled={value >= max}
      >
        +
      </Button>
    </div>
  )
}
