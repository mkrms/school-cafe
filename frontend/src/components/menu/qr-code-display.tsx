// src/components/menu/qr-code-display.tsx
"use client"

import { useEffect, useState } from "react"
import {QRCodeCanvas}  from 'qrcode.react'
import { Skeleton } from "@/components/ui/skeleton"

interface QrCodeDisplayProps {
  orderId: string
  size?: number
  includeText?: boolean
}

export const QrCodeDisplay = ({
  orderId,
  size = 200,
  includeText = true
}: QrCodeDisplayProps) => {
  const [isLoading, setIsLoading] = useState(true)

  // QRコードのデータを作成
  // 実際の環境では、より複雑な暗号化やデータ構造が必要になる場合がある
  const qrData = JSON.stringify({
    id: orderId,
    type: 'order',
    timestamp: Date.now()
  })

  useEffect(() => {
    // QRコードのレンダリングをシミュレート
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center">
      {isLoading ? (
        <Skeleton className="w-full h-full rounded-md" style={{ width: size, height: size }} />
      ) : (
        <>
          <div className="bg-white p-2 rounded-md">
            <QRCodeCanvas
              value={qrData}
              size={size}
              level="H"
            />
          </div>
          
          {includeText && (
            <p className="text-xs text-center mt-2 text-muted-foreground">
              注文ID: {orderId}
            </p>
          )}
        </>
      )}
    </div>
  )
}