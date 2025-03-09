import { Card, CardContent } from "@/components/ui/card"

type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
  options?: {
    name: string
    value: string
    price: number
  }[]
}

type OrderDetailsProps = {
  items: OrderItem[]
  subtotal: number
  total: number
  notes?: string
}

export function OrderDetails({ items, subtotal, total, notes }: OrderDetailsProps) {
  return (
    <Card className="w-full mb-4">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-4">注文内容</h3>

        <div className="space-y-4 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <div className="flex gap-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">×{item.quantity}</span>
                </div>

                {item.options && item.options.length > 0 && (
                  <div className="text-sm text-muted-foreground ml-2 mt-1">
                    {item.options.map((option, index) => (
                      <div key={index}>
                        {option.name}: {option.value}
                        {option.price > 0 && ` (+¥${option.price.toLocaleString()})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="font-medium">
                ¥{((item.price + (item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0)) * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>合計</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>

        {notes && notes.trim() !== "" && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">特記事項</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}