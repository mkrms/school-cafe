import { Card, CardContent } from "@/components/ui/card"

type OrderSummaryProps = {
  subtotal: number
  total: number
}

export function OrderSummary({ subtotal, total }: OrderSummaryProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="text-lg font-semibold mb-2">注文概要</div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">小計</span>
          <span>¥{subtotal.toLocaleString()}</span>
        </div>

        <div className="border-t pt-3 flex justify-between font-semibold">
          <span>合計</span>
          <span className="text-lg">¥{total.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}