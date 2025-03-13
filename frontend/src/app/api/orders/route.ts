import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { CartItem } from '@/types/utils'
import { getCurrentUser } from '@/lib/supabase'

const prisma = new PrismaClient()

// 注文作成API
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得と検証
    const items: CartItem[] = await request.json()
    const notes = request.nextUrl.searchParams.get('notes') || ''
    
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'カート内に商品がありません' },
        { status: 400 }
      )
    }

    // 注文の合計金額を計算
    const totalAmount = items.reduce((sum: number, item: CartItem) => {
      const optionsPrice = item.options
        ? item.options.reduce((optSum, opt) => optSum + opt.price, 0)
        : 0
      return sum + (item.price + optionsPrice) * item.quantity
    }, 0)

    //supabaseのuserIdをキャッチ
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      // ユーザーが認証されていない場合はエラーを返す
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // ログインユーザーのIDを使用
    const userId = user.id;

    // Prismaトランザクションで注文を作成
    const result = await prisma.$transaction(async (tx) => {
      // 注文の作成
      const order = await tx.order.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          total_amount: totalAmount,
          status: 'created',
          qr_code: null,
          payment_id: null,
          payment_status: 'pending',
          notes: notes,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      // 注文アイテムの作成
      await Promise.all(
        items.map((item) =>
          tx.orderItem.create({
            data: {
              id: uuidv4(),
              order_id: order.id,
              strapi_menu_id: item.id,
              menu_item_name: item.name,
              quantity: item.quantity,
              unit_price: item.price,
              created_at: new Date()
            }
          })
        )
      )

      return {
        orderId: order.id,
        totalAmount
      }
    })

    // 成功レスポンス
    return NextResponse.json({
      orderId: result.orderId,
      totalAmount: result.totalAmount,
      message: '注文が正常に作成されました'
    })
  } catch (error) {
    console.error('注文APIエラー:', error)
    return NextResponse.json(
      { error: '注文処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}