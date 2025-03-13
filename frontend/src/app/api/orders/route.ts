// src/app/api/orders/route.ts
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// 注文一覧取得API
export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        order_items: true, // 注文に関連する商品も取得
        payments: true,    // 決済情報も取得
      },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}