// src/components/kitchen/OrderQueue.tsx - 注文キュー表示コンポーネント
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User, DollarSign } from 'lucide-react'
import { OrderData } from '@/lib/qr-parser'

interface OrderQueueProps {
  orders: OrderData[]
  onPrintOrder: (order: OrderData) => void
  printedOrders: string[]
}

export default function OrderQueue({ 
  orders, 
  onPrintOrder, 
  printedOrders 
}: OrderQueueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          注文キュー
          <Badge variant="outline">{orders.length}件</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            処理待ちの注文はありません
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isPrinted = printedOrders.includes(order.orderId)
              
              return (
                <div key={order.orderId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isPrinted ? "secondary" : "default"}>
                        {order.orderId}
                      </Badge>
                      {isPrinted && (
                        <Badge variant="outline">印刷済み</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(order.orderTime).toLocaleTimeString('ja-JP')}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-2 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ¥{order.totalAmount}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-3">
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onPrintOrder(order)}
                    disabled={isPrinted}
                    className="w-full"
                  >
                    {isPrinted ? '印刷済み' : '伝票印刷'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}