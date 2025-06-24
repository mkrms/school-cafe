// src/components/kitchen/PrinterStatus.tsx - プリンター状態表示コンポーネント
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Printer, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'

interface PrinterStatusProps {
  connected: boolean
  ready: boolean
  error?: string
  ip?: string
  lastPrintTime?: Date
}

export default function PrinterStatus({ 
  connected, 
  ready, 
  error, 
  ip, 
  lastPrintTime 
}: PrinterStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            プリンター状態
          </div>
          <Badge variant={ready ? "default" : "destructive"}>
            {ready ? "稼働中" : "停止中"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm">接続済み</span>
              {ip && <span className="text-xs text-gray-500">({ip})</span>}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm">未接続</span>
            </>
          )}
        </div>

        {ready && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">印刷可能</span>
          </div>
        )}

        {lastPrintTime && (
          <div className="text-xs text-gray-500">
            最終印刷: {lastPrintTime.toLocaleString('ja-JP')}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}