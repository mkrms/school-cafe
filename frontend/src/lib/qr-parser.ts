// src/lib/qr-parser.ts - QRコード解析ユーティリティ
export interface OrderData {
  orderId: string
  customerId: string
  customerName: string
  items: OrderItem[]
  totalAmount: number
  paymentStatus: string
  orderTime: string
  qrValidUntil: string
  specialInstructions?: string
}

export interface OrderItem {
  menuId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

export class QRParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QRParseError'
  }
}

export function parseQRData(qrData: string): OrderData {
  try {
    // JSONフォーマットのチェック
    if (qrData.startsWith('{')) {
      const data = JSON.parse(qrData)
      
      // 必須フィールドの検証
      validateOrderData(data)
      
      return data
    }

    // その他のフォーマット（将来の拡張用）
    throw new QRParseError('サポートされていないQRコード形式です')
    
  } catch (error) {
    if (error instanceof QRParseError) {
      throw error
    }
    throw new QRParseError('QRコードの解析に失敗しました')
  }
}

function validateOrderData(data: any): void {
  const requiredFields = ['orderId', 'items', 'totalAmount', 'paymentStatus']
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new QRParseError(`必須フィールド "${field}" が不足しています`)
    }
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new QRParseError('注文アイテムが正しく設定されていません')
  }

  // 有効期限チェック
  if (data.qrValidUntil) {
    const validUntil = new Date(data.qrValidUntil)
    if (validUntil < new Date()) {
      throw new QRParseError('QRコードの有効期限が切れています')
    }
  }
}
