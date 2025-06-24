// src/lib/paypay.ts
import { CartItem } from "@/types/utils";

export interface PayPayOrderRequest {
  orderId: string;
  amount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  description: string;
}

export interface PayPayResponse {
  status: "success" | "error";
  data?: {
    url: string;
    paymentId: string;
    deeplink: string;
  };
  error?: string;
}

export interface OrderData {
  orderId: string;
  totalAmount: number;
  items: CartItem[];
}

/**
 * PayPay決済のリクエストを作成
 */
export async function createPayPayPayment(
  orderData: OrderData
): Promise<PayPayResponse> {
  try {
    // PayPayのリクエスト形式に変換
    const paymentRequest: PayPayOrderRequest = {
      orderId: orderData.orderId,
      amount: orderData.totalAmount,
      items: orderData.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      description: `Gakushoku GO 注文 #${orderData.orderId}`,
    };

    // PayPay API呼び出し
    const response = await fetch("/api/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentRequest),
    });

    return await response.json();
  } catch (error) {
    console.error("PayPay payment creation error:", error);
    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "決済処理中にエラーが発生しました",
    };
  }
}

/**
 * PayPay決済状態確認
 */
export async function checkPayPayPaymentStatus(
  merchantPaymentId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const response = await fetch(
      `/api/payment-status?merchantPaymentId=${merchantPaymentId}`
    );
    return await response.json();
  } catch (error) {
    console.error("PayPay status check error:", error);
    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "決済状態確認中にエラーが発生しました",
    };
  }
}

/**
 * 注文状態の更新
 */
export async function updateOrderStatus(
  orderId: string,
  paymentId: string,
  status: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const response = await fetch("/api/update-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        status,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Order update error:", error);
    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "注文更新中にエラーが発生しました",
    };
  }
}
