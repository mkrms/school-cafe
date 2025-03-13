"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { MenuCategory } from "@/types/strapi"

type CategoryFilterProps = {
  categories: MenuCategory[]
  onSelectCategory: (categoryId: number | null) => void
}

export function CategoryFilter({ categories, onSelectCategory }: CategoryFilterProps) {
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
          
          {categories.map((category) => (
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