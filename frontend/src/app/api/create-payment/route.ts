// app/api/create-payment/route.ts
import { NextResponse } from 'next/server';
import PAYPAY from '@paypayopa/paypayopa-sdk-node';

// リクエスト型定義
interface PaymentRequest {
  orderId: string;
  amount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  description: string;
}

// PayPay SDKの設定
PAYPAY.Configure({
  clientId: process.env.PAYPAY_API_KEY || '',
  clientSecret: process.env.PAYPAY_API_SECRET || '',
  merchantId: process.env.PAYPAY_MERCHANT_ID || '',
  productionMode: false, // サンドボックス環境
});

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const body = await request.json() as PaymentRequest;
    const { amount, orderId, items, description } = body;

    console.log('決済リクエスト受信:', { amount, orderId, description });

    // PayPayペイロード作成
    const payload = {
      merchantPaymentId: orderId,
      amount: {
        amount: amount,
        currency: "JPY"
      },
      codeType: "ORDER_QR",
      orderDescription: description,
      orderItems: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: {
          amount: item.price,
          currency: "JPY"
        }
      })),
      isAuthorization: false,
      // リダイレクトURLにmerchantPaymentIdを含める
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/completion?merchantPaymentId=${orderId}`,
      redirectType: "WEB_LINK",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1"
    };

    // PayPay QRコード生成API呼び出し
    return new Promise((resolve) => {
      PAYPAY.QRCodeCreate(payload, (response: any) => {
        console.log('PayPay API レスポンス:', response);

        // 成功したらアプリ起動用URLと決済IDを返す
        if (response?.BODY?.resultInfo?.code === "SUCCESS") {
          resolve(NextResponse.json({
            status: "success",
            data: {
              url: response.BODY.data.url,
              paymentId: response.BODY.data.paymentId,
              deeplink: response.BODY.data.deeplink
            }
          }));
        } else {
          // エラー時のレスポンス
          resolve(NextResponse.json({
            status: "error",
            error: response?.BODY?.resultInfo || "Unknown error"
          }, { status: 400 }));
        }
      });
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}