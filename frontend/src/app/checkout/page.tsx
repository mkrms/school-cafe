"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartItemList } from "@/components/cart/cart-item-list"
import { OrderSummary } from "@/components/menu/order-summary"

// 仮のカートデータ
const dummyCartItems = [
  {
    id: "1",
    name: "唐揚げ定食",
    price: 650,
    quantity: 1,
    options: [
      { name: "ご飯のサイズ", value: "大盛り", price: 50 },
      { name: "トッピング", value: "温泉卵", price: 80 }
    ],
    imageUrl: "/images/menu-placeholder.svg"
  },
  {
    id: "2",
    name: "カレーライス",
    price: 500,
    quantity: 2,
    options: [
      { name: "辛さ", value: "中辛", price: 0 }
    ],
    imageUrl: "/images/menu-placeholder.svg"
  }
]

// 合計金額の計算
const calculateSubtotal = (items: typeof dummyCartItems) => {
  return items.reduce((sum, item) => {
    const optionsPrice = item.options ?
      item.options.reduce((optSum, opt) => optSum + opt.price, 0) : 0
    return sum + ((item.price + optionsPrice) * item.quantity)
  }, 0)
}

export default function CheckoutPage() {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = calculateSubtotal(dummyCartItems)
  // 実際のアプリでは送料や割引などが加わる可能性がある
  const total = subtotal

  const handleSubmit = () => {
    setIsSubmitting(true)

    // 実際のアプリでは、ここで注文を確定するAPIを呼び出します
    setTimeout(() => {
      // 決済ページへリダイレクト
      router.push("/payment")
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        showBackButton={true}
        title="注文確認"
        onBackClick={() => router.back()}
      />

      <main className="flex-grow p-4">
        {/* カート内の商品一覧 */}
        <CartItemList items={dummyCartItems} />

        {/* 注文概要 */}
        <OrderSummary subtotal={subtotal} total={total} />

        {/* 特記事項入力 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Label htmlFor="notes" className="text-lg font-semibold block mb-2">
              特記事項
            </Label>
            <Textarea
              id="notes"
              placeholder="アレルギーや調理の要望があればこちらにご記入ください"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* 決済ボタン */}
        <Button
          className="w-full h-12 text-lg mb-4"
          disabled={isSubmitting || dummyCartItems.length === 0}
          onClick={handleSubmit}
        >
          {isSubmitting ? "処理中..." : "決済へ進む"}
        </Button>

        {/* 注意事項 */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>※注文確定後のキャンセルはできません。</p>
          <p>※商品の準備ができましたら、QRコードをカウンターでご提示ください。</p>
          <p>※アレルギー等の特記事項は必ずご記入ください。</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}