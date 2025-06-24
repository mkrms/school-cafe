// src/app/kitchen/printer-test/page.tsx
import { Metadata } from 'next'
import PrinterTestSystem from '@/components/kitchen/PrinterTestSystem'

export const metadata: Metadata = {
  title: 'プリンター接続テスト - 学食管理',
  description: 'EPSONプリンターとの接続テストと印刷テストを行います'
}

export default function PrinterTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PrinterTestSystem />
    </div>
  )
}