"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2 } from "lucide-react"

type QRCodeDisplayProps = {
  orderId: string
  qrCodeUrl: string
  orderTime: string
  orderStatus: "pending" | "preparing" | "ready" | "completed" | "cancelled"
}

export function QRCodeDisplay({
  orderId,
  qrCodeUrl,
  orderTime,
  orderStatus
}: QRCodeDisplayProps) {
  const router = useRouter()

  // QRコードをダウンロードする処理
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `order-${orderId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // QRコードを共有する処理（対応ブラウザのみ）
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `注文 #${orderId}`,
          text: `学食注文 #${orderId} のQRコード`,
          url: window.location.href
        })
      } catch (error) {
        console.error("共有に失敗しました", error)
      }
    }
  }

  // 注文ステータスに応じたラベルと色を取得
  const getStatusInfo = () => {
    switch (orderStatus) {
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

  const statusInfo = getStatusInfo()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 flex flex-col items-center">
        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground mb-1">{orderTime}</div>
          <h2 className="text-xl font-bold">注文 #{orderId.substring(0, 8).toUpperCase()}</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="border rounded-lg p-4 mb-4 w-full max-w-[250px]">
          <div className="relative aspect-square">
            <Image
              src={qrCodeUrl}
              alt={`注文 #${orderId} QRコード`}
              fill
              className="object-contain"
            />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          このQRコードを学食カウンターの端末にかざして、注文を受け取ってください
        </p>

        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            保存
          </Button>
          {/* {navigator.share() && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            共有
          </Button>
        )} */}
        </div>
      </CardContent>
    </Card>
  )
}