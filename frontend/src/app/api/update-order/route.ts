// app/api/update-order/route.ts
import { NextResponse } from 'next/server';

// リクエスト型定義
interface UpdateOrderRequest {
  orderId: string;
  paymentId: string;
  status: string;
}

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const body = await request.json() as UpdateOrderRequest;
    const { orderId, paymentId, status } = body;

    console.log('注文更新リクエスト:', { orderId, paymentId, status });

    // 注: 実際の実装ではデータベースに注文状態を更新する処理を追加
    // ここではダミーのレスポンスを返す

    // 成功レスポンスを返す
    return NextResponse.json({
      status: "success",
      data: {
        orderId,
        updatedStatus: status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}