"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

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

type CartItem = typeof dummyCartItems[0]

// 合計金額の計算
const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => {
    const optionsPrice = item.options ?
      item.options.reduce((optSum, opt) => optSum + opt.price, 0) : 0
    return sum + ((item.price + optionsPrice) * item.quantity)
  }, 0)
}

type CartDrawerProps = {
  cartItems?: CartItem[]
  onUpdateQuantity?: (id: string, quantity: number) => void
  onRemoveItem?: (id: string) => void
  onCheckout?: () => void
}

export function CartDrawer({
  cartItems = dummyCartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const total = calculateTotal(cartItems)
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, quantity)
    }
  }

  const handleRemoveItem = (id: string) => {
    if (onRemoveItem) {
      onRemoveItem(id)
    }
  }

  const handleCheckout = () => {
    setIsOpen(false)
    if (onCheckout) {
      onCheckout()
    } else {
      router.push("/checkout")
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-xl">カート</SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 px-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">カートが空です</p>
              <p className="text-sm text-muted-foreground text-center mb-4">
                メニューから商品を追加してください
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setIsOpen(false)
                  router.push("/")
                }}
              >
                メニューを見る
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <button
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-sm text-muted-foreground mt-1">
                        ¥{item.price.toLocaleString()}
                      </div>

                      {item.options && item.options.length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.options.map((option, index) => (
                            <div key={index}>
                              {option.name}: {option.value}
                              {option.price > 0 && ` (+¥${option.price.toLocaleString()})`}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-medium">
                          ¥{((item.price + (item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0)) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>合計</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <Button
              className="w-full h-12"
              onClick={handleCheckout}
            >
              注文確認へ進む
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}