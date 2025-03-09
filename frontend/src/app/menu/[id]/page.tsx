"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MenuOption } from "@/components/menu/menu-option"
import { QuantitySelector } from "@/components/menu/quantity-selector"
import { ShoppingCart } from "lucide-react"

// 仮の商品データ（実際にはAPIから取得）
const menuItem = {
  id: "1",
  name: "唐揚げ定食",
  price: 650,
  description: "サクサクの唐揚げに、ご飯、味噌汁、サラダがセットになった定食です。唐揚げは特製のタレに漬け込んだ若鶏を使用し、外はカリッと中はジューシーに揚げています。",
  imageUrl: "/images/menu-placeholder.svg",
  categoryId: 1,
  options: [
    {
      title: "ご飯のサイズ",
      options: [
        { id: "rice-normal", name: "普通", price: 0 },
        { id: "rice-large", name: "大盛り", price: 50 },
        { id: "rice-small", name: "小盛り", price: 0 }
      ]
    },
    {
      title: "トッピング",
      options: [
        { id: "topping-none", name: "なし", price: 0 },
        { id: "topping-egg", name: "温泉卵", price: 80 },
        { id: "topping-cheese", name: "チーズ", price: 100 }
      ]
    }
  ]
}

export default function MenuDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [cartItemCount, setCartItemCount] = useState(0)

  // 選択されたオプションの価格を計算
  const calculateOptionPrice = () => {
    let optionPrice = 0

    Object.values(selectedOptions).forEach(optionId => {
      menuItem.options.forEach(optionGroup => {
        const selectedOption = optionGroup.options.find(opt => opt.id === optionId)
        if (selectedOption) {
          optionPrice += selectedOption.price
        }
      })
    })

    return optionPrice
  }

  // 合計金額を計算
  const totalPrice = (menuItem.price + calculateOptionPrice()) * quantity

  // オプション選択時の処理
  const handleOptionChange = (optionGroupTitle: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionGroupTitle]: optionId
    }))
  }

  // カートに追加する処理
  const handleAddToCart = () => {
    setCartItemCount(prev => prev + quantity)
    // ここで実際のカート追加処理を行います（今回は実装しません）

    // フィードバックを表示して、少し待ってからホームに戻ります
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  // コンポーネントマウント時に初期オプション選択を設定
  useEffect(() => {
    const initialOptions: Record<string, string> = {}
    menuItem.options.forEach(optionGroup => {
      initialOptions[optionGroup.title] = optionGroup.options[0].id
    })
    setSelectedOptions(initialOptions)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        showBackButton={true}
        title="メニュー詳細"
        onBackClick={() => router.back()}
        cartItemCount={cartItemCount}
      />

      <main className="flex-grow">
        {/* 商品画像 */}
        <div className="relative h-64 w-full">
          <Image
            src={menuItem.imageUrl}
            alt={menuItem.name}
            fill
            className="object-cover"
          />
        </div>

        {/* 商品情報 */}
        <div className="p-4">
          <h1 className="text-2xl font-bold">{menuItem.name}</h1>
          <p className="text-xl font-bold mt-1 mb-3">¥{menuItem.price.toLocaleString()}</p>
          <p className="text-muted-foreground mb-6">{menuItem.description}</p>

          {/* オプション選択 */}
          <div className="mb-6">
            {menuItem.options.map(optionGroup => (
              <MenuOption
                key={optionGroup.title}
                title={optionGroup.title}
                options={optionGroup.options}
                onChange={(optionId) => handleOptionChange(optionGroup.title, optionId)}
              />
            ))}
          </div>

          {/* 数量選択 */}
          <div className="flex justify-between items-center mb-6">
            <span className="font-medium">数量</span>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              maxQuantity={10}
            />
          </div>

          {/* 合計金額と注文ボタン */}
          <div className="sticky bottom-4 bg-background pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">合計</span>
              <span className="text-xl font-bold">¥{totalPrice.toLocaleString()}</span>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 text-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              カートに追加
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}