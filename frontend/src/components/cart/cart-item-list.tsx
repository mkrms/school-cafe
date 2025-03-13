import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { CartItem } from "@/types/utils"

type CartItemListProps = {
  items: CartItem[]
}

export function CartItemList({ items }: CartItemListProps) {
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="text-lg font-semibold mb-3">注文内容</div>

        {items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            カートに商品がありません
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 py-2 border-b last:border-0">
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
                    <span className="font-medium">¥{(item.price * item.quantity).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>数量: {item.quantity}</span>
                    <span>¥{item.price.toLocaleString()} × {item.quantity}</span>
                  </div>

                  {item.options && item.options.length > 0 && (
                    <div className="mt-2 text-sm">
                      {item.options.map((option, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{option.name}: {option.value}</span>
                          {option.price > 0 && <span>+¥{option.price.toLocaleString()}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}