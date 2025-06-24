"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { OrderHistoryItem } from "@/components/menu/order-history-item"
import { OrderStatusTabs } from "@/components/menu/order-status-tabs"
import { CircleAlert } from "lucide-react"

// 仮の注文履歴データ
// const sampleOrders = [
//   {
//     id: "ord123456789",
//     createdAt: "2025-03-09T12:30:45Z",
//     total: 1780,
//     status: "preparing" as const,
//     items: [
//       { name: "唐揚げ定食", quantity: 1 },
//       { name: "カレーライス", quantity: 2 }
//     ]
//   },
//   {
//     id: "ord987654321",
//     createdAt: "2025-03-08T13:15:22Z",
//     total: 1250,
//     status: "completed" as const,
//     items: [
//       { name: "牛丼", quantity: 1 },
//       { name: "塩ラーメン", quantity: 1 }
//     ]
//   },
//   {
//     id: "ord456789123",
//     createdAt: "2025-03-07T11:45:10Z",
//     total: 950,
//     status: "completed" as const,
//     items: [
//       { name: "カツ丼", quantity: 1 },
//       { name: "みそ汁", quantity: 1 },
//       { name: "サラダ", quantity: 1 }
//     ]
//   },
//   {
//     id: "ord654321987",
//     createdAt: "2025-03-06T12:20:33Z",
//     total: 680,
//     status: "cancelled" as const,
//     items: [
//       { name: "親子丼", quantity: 1 },
//       { name: "お茶", quantity: 1 }
//     ]
//   },
//   {
//     id: "ord321654987",
//     createdAt: "2025-03-05T18:10:15Z",
//     total: 1500,
//     status: "completed" as const,
//     items: [
//       { name: "天丼", quantity: 1 },
//       { name: "うどん", quantity: 1 },
//       { name: "アイスクリーム", quantity: 1 }
//     ]
//   }
// ]

interface Order {
  id: string
  createdAt: string
  total: number
  status: string
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const [activeStatus, setActiveStatus] = useState("all")
  const [order, setOrder] = useState<Order>()

  // ステータスでフィルタリングした注文履歴
  // const filteredOrders = activeStatus === "all"
  //   ? sampleOrders
  //   : sampleOrders.filter(order => order.status === activeStatus)

    useEffect(() => {
      const fetchOrders = async () => {
        const response = await fetch("/api/orders")
        const data = await response.json()
        console.log(data)
        setOrder(data)
      }
      fetchOrders()
    }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="注文履歴"
        showBackButton={true}
        onBackClick={() => router.push("/")}
      />

      <main className="flex-grow p-4">
        {/* フィルタータブ */}
        <OrderStatusTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />

        {/* 注文リスト */}
        {order && Array.isArray(order) && order.length > 0 ? (
          <div>
            {order.map((orderItem) => (
              <OrderHistoryItem
                key={orderItem.id}
                id={orderItem.id}
                createdAt={orderItem.created_at}
                total={orderItem.total_amount}
                status={orderItem.status}
                items={orderItem.order_items}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CircleAlert className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">注文履歴がありません</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {activeStatus === "all"
                ? "まだ注文履歴がありません。メニューから注文してみましょう。"
                : `${getStatusLabel(activeStatus)}の注文はありません。`}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

// ステータスに応じたラベルを取得する関数
function getStatusLabel(status: string) {
  switch (status) {
    case "pending": return "支払い待ち"
    case "preparing": return "準備中"
    case "ready": return "受取待ち"
    case "completed": return "完了済み"
    case "cancelled": return "キャンセル済み"
    default: return status
  }
}