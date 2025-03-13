// src/app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

// 特定の注文を取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Supabaseクライアントの作成
    const supabase = createServerSupabaseClient()

    // セッションの取得
    const { data: { session } } = await supabase.auth.getSession()

    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 注文データを取得
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        order_items: {
          include: {
            menu_item: true,
          },
        },
        payments: true,
      },
    })

    // 注文が存在しない場合
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 自分の注文かどうか確認（管理者は例外）
    if (order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ data: order })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// 注文をキャンセル
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Supabaseクライアントの作成
    const supabase = createServerSupabaseClient()

    // セッションの取得
    const { data: { session } } = await supabase.auth.getSession()

    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // リクエストボディを取得
    const body = await request.json()
    const { cancelReason } = body

    // 注文データを取得
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            menu_item: true,
          },
        },
      },
    })

    // 注文が存在しない場合
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 自分の注文かどうか確認
    if (order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // 既にキャンセルされているか確認
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      )
    }

    // 完了済みの注文はキャンセル不可
    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Completed orders cannot be cancelled' },
        { status: 400 }
      )
    }

    // トランザクションで注文をキャンセル
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 注文ステータスを更新
      const cancelled = await tx.order.update({
        where: { id },
        data: {
          status: 'cancelled',
          cancel_reason: cancelReason || 'Cancelled by user',
        },
        include: {
          order_items: true,
        },
      })

      // 在庫を戻す
      for (const item of order.order_items) {
        const menuItem = item.menu_item
        if (menuItem.stock_quantity !== null) {
          await tx.menuItem.update({
            where: { id: menuItem.id },
            data: {
              stock_quantity: { increment: item.quantity },
              sold_out: false, // 在庫が戻ったので売り切れ状態を解除
            },
          })
        }
      }

      return cancelled
    })

    return NextResponse.json({
      data: updatedOrder,
      message: 'Order cancelled successfully',
    })
  } catch (error: any) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}

// 注文ステータスの更新（主に管理者用）
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Supabaseクライアントの作成
    const supabase = createServerSupabaseClient()

    // セッションの取得
    const { data: { session } } = await supabase.auth.getSession()

    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // リクエストボディを取得
    const body = await request.json()
    const { status, notes } = body

    // ステータスの検証
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // 注文データを取得
    const order = await prisma.order.findUnique({
      where: { id },
    })

    // 注文が存在しない場合
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 自分の注文かどうか確認
    if (order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // 注文更新
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        order_items: true,
      },
    })

    return NextResponse.json({
      data: updatedOrder,
      message: 'Order updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}