// src/app/kitchen/qr-reader/page.tsx
import { Metadata } from 'next'
import QRReaderSystem from '@/components/kitchen/QRReaderSystem'

export const metadata: Metadata = {
  title: 'QRコード受付システム - 学食管理',
  description: 'QRコードを読み取って注文を処理し、伝票を印刷します'
}

export default function QRReaderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <QRReaderSystem />
    </div>
  )
}