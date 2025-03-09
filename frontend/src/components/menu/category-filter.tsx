"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// 仮のカテゴリデータ
const sampleCategories = [
  { id: 1, name: "定食" },
  { id: 2, name: "丼物" },
  { id: 3, name: "麺類" },
  { id: 4, name: "カレー" },
  { id: 5, name: "サイドメニュー" },
  { id: 6, name: "ドリンク" }
]

type CategoryFilterProps = {
  onSelectCategory: (categoryId: number | null) => void
}

export function CategoryFilter({ onSelectCategory }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  const handleCategoryClick = (categoryId: number | null) => {
    setActiveCategory(categoryId)
    onSelectCategory(categoryId)
  }

  return (
    <div className="w-full pb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 px-4 py-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            className="flex-shrink-0 rounded-full px-4"
            onClick={() => handleCategoryClick(null)}
          >
            すべて
          </Button>

          {sampleCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="flex-shrink-0 rounded-full px-4"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}