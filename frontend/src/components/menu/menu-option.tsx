"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

type OptionItem = {
  id: string
  name: string
  price: number
}

type MenuOptionProps = {
  title: string
  options: OptionItem[]
  onChange: (optionId: string) => void
}

export function MenuOption({ title, options, onChange }: MenuOptionProps) {
  const [selectedOption, setSelectedOption] = useState<string>(options[0]?.id || "")

  const handleChange = (value: string) => {
    setSelectedOption(value)
    onChange(value)
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="mb-2 font-medium">{title}</div>
        <RadioGroup
          value={selectedOption}
          onValueChange={handleChange}
          className="space-y-2"
        >
          {options.map(option => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.name}
                </Label>
              </div>
              {option.price > 0 && (
                <div className="text-sm font-medium">+¥{option.price}</div>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}