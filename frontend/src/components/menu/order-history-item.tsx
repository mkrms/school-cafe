"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

type OrderHistoryItemProps = {
  id: string
  createdAt: string
  total: number
  status: "created" | "pending" | "preparing" | "ready" | "completed" | "cancelled"
  items: {
    name: string
    quantity: number
  }[]
}

// 日付をフォーマットする関数
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// ステータスに応じたラベルと色を取得する関数
function getStatusInfo(status: OrderHistoryItemProps["status"]) {
  switch (status) {
    case "created":
      return { label: "注文作成", color: "bg-gray-100 text-gray-800" }
    case "pending":
      return { label: "支払い待ち", color: "bg-yellow-100 text-yellow-800" }
    case "preparing":
      return { label: "準備中", color: "bg-blue-100 text-blue-800" }
    case "ready":
      return { label: "受取待ち", color: "bg-green-100 text-green-800" }
    case "completed":
      return { label: "完了", color: "bg-gray-100 text-gray-800" }
    case "cancelled":
      return { label: "キャンセル", color: "bg-red-100 text-red-800" }
  }
}

export function OrderHistoryItem({ id, createdAt, total, status, items }: OrderHistoryItemProps) {
  const statusInfo = getStatusInfo(status)
  const displayId = id.substring(0, 8).toUpperCase()

  // 商品名の表示（最初の2つのみ表示し、それ以上あれば「他N点」と表示）
  const displayItems = () => {
    if (items.length === 0) return "商品なし"

    const firstItems = items.slice(0, 2).map(item => `${item.name} × ${item.quantity}`).join(", ")

    if (items.length <= 2) return firstItems

    const remainingCount = items.length - 2
    return `${firstItems} 他${remainingCount}点`
  }

  return (
    <Link href={`/orders/${id}`}>
      <Card className="mb-3 hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <span className="font-medium mr-2">注文 #{displayId}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(createdAt)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {displayItems()}
              </p>

              <div className="font-medium">
                ¥{total.toLocaleString()}
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}