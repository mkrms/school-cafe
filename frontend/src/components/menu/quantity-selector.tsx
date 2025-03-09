"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

type QuantitySelectorProps = {
  quantity: number
  onQuantityChange: (quantity: number) => void
  minQuantity?: number
  maxQuantity?: number
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 10
}: QuantitySelectorProps) {
  const increment = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1)
    }
  }

  const decrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={decrement}
        disabled={quantity <= minQuantity}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={increment}
        disabled={quantity >= maxQuantity}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}