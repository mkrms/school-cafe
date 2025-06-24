// app/api/create-payment/route.ts
import { NextResponse } from "next/server";

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
  redirectUrl?: string; // クライアントから指定されたリダイレクトURL
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { default: PAYPAY } = await import("@paypayopa/paypayopa-sdk-node");

    // PayPay SDKの設定
    PAYPAY.Configure({
      clientId: process.env.PAYPAY_API_KEY || "",
      clientSecret: process.env.PAYPAY_API_SECRET || "",
      merchantId: process.env.PAYPAY_MERCHANT_ID || "",
      productionMode: false, // サンドボックス環境
    });
    // リクエストボディを取得
    const body = (await request.json()) as PaymentRequest;
    const { amount, orderId, items, description, redirectUrl } = body;

    console.log("決済リクエスト受信:", {
      amount,
      orderId,
      description,
      redirectUrl,
    });

    // PayPayペイロード作成
    const payload = {
      merchantPaymentId: orderId,
      amount: {
        amount: amount,
        currency: "JPY",
      },
      codeType: "ORDER_QR",
      orderDescription: description,
      orderItems: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: {
          amount: item.price,
          currency: "JPY",
        },
      })),
      isAuthorization: false,
      // リダイレクトURL設定
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`,
      redirectType: "WEB_LINK",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1",
    };

    // PayPay QRコード生成API呼び出し
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PAYPAY.QRCodeCreate(payload, (response: any) => {
        console.log("PayPay API レスポンス:", response);

        // 成功したらアプリ起動用URLと決済IDを返す
        if (response?.BODY?.resultInfo?.code === "SUCCESS") {
          resolve(
            NextResponse.json({
              status: "success",
              data: {
                url: response.BODY.data.url,
                paymentId: response.BODY.data.paymentId,
                deeplink: response.BODY.data.deeplink,
              },
            })
          );
        } else {
          // テスト環境用のダミーレスポンス
          if (process.env.NODE_ENV !== "production") {
            console.log("PayPay APIエラー、テスト用ダミーデータを返します");
            resolve(
              NextResponse.json({
                status: "success",
                data: {
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?merchantPaymentId=${orderId}`,
                  paymentId: "test_payment_id",
                  deeplink: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?merchantPaymentId=${orderId}`,
                },
              })
            );
          } else {
            // 本番環境でのエラーレスポンス
            resolve(
              NextResponse.json(
                {
                  status: "error",
                  error: response?.BODY?.resultInfo || "Unknown error",
                },
                { status: 400 }
              )
            );
          }
        }
      });
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
