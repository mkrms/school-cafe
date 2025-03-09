"use client"

import { useState } from "react"
import { CategoryFilter } from "@/components/menu/category-filter"
import { MenuCard } from "@/components/menu/menu-card"
import { BusinessHours } from "@/components/menu/business-hours"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// 仮のメニューデータ
const sampleMenuItems = [
  {
    id: "1",
    name: "唐揚げ定食",
    price: 650,
    description: "サクサクの唐揚げに、ご飯、味噌汁、サラダがセットになった定食です。",
    imageUrl: "/images/menu-placeholder.svg",
    categoryId: 1
  },
  {
    id: "2",
    name: "カレーライス",
    price: 500,
    description: "濃厚な味わいのカレーに、ふっくらご飯がセットです。",
    imageUrl: "/images/menu-placeholder.svg",
    categoryId: 4
  },
  {
    id: "3",
    name: "牛丼",
    price: 580,
    description: "甘辛く煮込んだ牛肉をご飯にのせた定番メニュー。",
    imageUrl: "/images/menu-placeholder.svg",
    categoryId: 2
  },
  {
    id: "4",
    name: "塩ラーメン",
    price: 600,
    description: "あっさりとした塩スープに、モチモチの麺が絡む一品。",
    imageUrl: "/images/menu-placeholder.svg",
    categoryId: 3
  },
  {
    id: "5",
    name: "醤油ラーメン",
    price: 600,
    description: "コクのある醤油スープに、モチモチの麺が絡む一品。",
    imageUrl: "/images/menu-placeholder.svg",
    categoryId: 3
  },
  {
    id: "6",
    name: "ポテトフライ",
    price: 300,
    description: "カリッと揚げたポテトフライ。単品でもセットでも人気です。",
    imageUrl: "/images/menu-placeholder.svg",
    categoryId: 5
  }
]

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)

  // カテゴリーでフィルタリングされたメニュー項目
  const filteredMenuItems = selectedCategory
    ? sampleMenuItems.filter(item => item.categoryId === selectedCategory)
    : sampleMenuItems

  // カートに商品を追加する処理（実際には機能しない）
  const handleAddToCart = (id: string) => {
    setCartItemCount(prevCount => prevCount + 1)
    // 実際の実装では、ここでカートに商品を追加するロジックを実装します
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <Header cartItemCount={cartItemCount} />

      {/* メインコンテンツ */}
      <main className="flex-grow pb-4">
        {/* 営業時間 */}
        <div className="px-4 pt-4">
          <BusinessHours />
        </div>

        {/* カテゴリーフィルター */}
        <CategoryFilter onSelectCategory={setSelectedCategory} />

        {/* メニュー一覧 */}
        <div className="px-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredMenuItems.map(item => (
            <MenuCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              description={item.description}
              imageUrl={item.imageUrl}
              onAddToCart={handleAddToCart}
            />
          ))}

          {filteredMenuItems.length === 0 && (
            <div className="col-span-2 py-10 text-center text-muted-foreground">
              該当するメニューがありません
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  )
}