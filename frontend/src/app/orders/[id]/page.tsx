"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { QRCodeDisplay } from "@/components/menu/qr-code-display"
import { OrderDetails } from "@/components/menu/order-details"
import { Home, ArrowLeft } from "lucide-react"

// 仮の注文データ
const sampleOrderData = {
  id: "ord123456789",
  status: "preparing" as const,
  createdAt: "2023-03-09T12:30:45Z",
  items: [
    {
      id: "1",
      name: "唐揚げ定食",
      price: 650,
      quantity: 1,
      options: [
        { name: "ご飯のサイズ", value: "大盛り", price: 50 },
        { name: "トッピング", value: "温泉卵", price: 80 }
      ]
    },
    {
      id: "2",
      name: "カレーライス",
      price: 500,
      quantity: 2,
      options: [
        { name: "辛さ", value: "中辛", price: 0 }
      ]
    }
  ],
  subtotal: 1780,
  total: 1780,
  notes: "カレーは辛すぎないようにお願いします。",
  qrCodeUrl: "/images/qr.svg" // 実際にはQRコード画像のURLが入ります
}

// 日付をフォーマットする関数
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

type OrderCompletePageProps = {
  params?: {
    id?: string
  }
  searchParams?: {
    from?: string
  }
}

export default function OrderCompletePage({ params, searchParams }: OrderCompletePageProps) {
  const router = useRouter()
  const [isFromPayment, setIsFromPayment] = useState(false)

  // パラメータからの注文ID取得
  const orderId = params?.id || sampleOrderData.id

  // 現実のアプリでは、ここでAPIから注文データを取得します
  const orderData = sampleOrderData

  // パスからの遷移元を確認
  useEffect(() => {
    if (searchParams?.from === 'payment') {
      setIsFromPayment(true)
    }
  }, [searchParams])

  // 戻るボタンの処理
  const handleBack = () => {
    if (isFromPayment) {
      // 決済から来た場合はホームに戻る
      router.push('/')
    } else {
      // 注文履歴からの場合は履歴画面に戻る
      router.push('/orders')
    }
  }

  // ホームに戻る処理
  const goToHome = () => {
    router.push('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        showBackButton={true}
        title={isFromPayment ? "注文完了" : "注文詳細"}
        onBackClick={handleBack}
      />

      <main className="flex-grow p-4 space-y-6">
        {/* QRコード表示 */}
        <QRCodeDisplay
          orderId={orderData.id}
          qrCodeUrl={orderData.qrCodeUrl}
          orderTime={formatDate(orderData.createdAt)}
          orderStatus={orderData.status}
        />

        {/* 注文詳細 */}
        <OrderDetails
          items={orderData.items}
          subtotal={orderData.subtotal}
          total={orderData.total}
          notes={orderData.notes}
        />

        {/* アクションボタン */}
        {isFromPayment && (
          <div className="pt-4">
            <Button
              className="w-full h-12"
              onClick={goToHome}
            >
              <Home className="mr-2 h-5 w-5" />
              メニューに戻る
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}