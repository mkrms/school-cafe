"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCodeDisplay } from "@/components/menu/qr-code-display";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

// 決済詳細の型定義
interface PaymentDetails {
  status: string;
  paymentId: string;
  merchantPaymentId: string;
  amount: {
    amount: number;
    currency: string;
  };
  orderDescription: string;
}

export default function PaymentCompletionPage() {
  const [paymentStatus, setPaymentStatus] = useState<string>("checking");
  const [orderDetails, setOrderDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // URLからPayPay関連のパラメータを取得
  const paymentId = searchParams.get("paymentId");
  const merchantPaymentId = searchParams.get("merchantPaymentId");
  const status = searchParams.get("status");

  useEffect(() => {
    async function checkPaymentStatus() {
      // デバッグ情報を出力
      console.log("URL Parameters:", {
        paymentId,
        merchantPaymentId,
        status,
      });

      console.log("SessionStorage Data:", {
        pendingPaymentId: sessionStorage.getItem("pendingPaymentId"),
        pendingOrderId: sessionStorage.getItem("pendingOrderId"),
      });

      // パラメータがない場合はセッションストレージから取得
      // const pendingPaymentId = sessionStorage.getItem('pendingPaymentId');
      const pendingOrderId = sessionStorage.getItem("pendingOrderId");

      // merchantPaymentId を優先的に使用
      const merchantPaymentIdToCheck = merchantPaymentId || pendingOrderId;

      if (!merchantPaymentIdToCheck) {
        setError("注文IDが見つかりません");
        setPaymentStatus("error");
        return;
      }

      try {
        console.log(
          `決済状態確認中: merchantPaymentId=${merchantPaymentIdToCheck}`
        );

        // サーバーに決済状態を問い合わせる
        const response = await fetch(
          `/api/payment-status?merchantPaymentId=${merchantPaymentIdToCheck}`
        );

        if (!response.ok) {
          throw new Error(
            `APIエラー: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log("決済状態確認結果:", result);

        if (result.status === "success") {
          const paymentData = result.data as PaymentDetails;

          // 決済状態に応じた処理
          if (paymentData.status === "COMPLETED") {
            setPaymentStatus("completed");
            setOrderDetails(paymentData);

            // 注文データを更新するAPI呼び出し
            await fetch("/api/update-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: merchantPaymentIdToCheck,
                paymentId: paymentData.paymentId,
                status: "paid",
              }),
            });
          } else if (paymentData.status === "AUTHORIZED") {
            setPaymentStatus("authorized");
            setOrderDetails(paymentData);
          } else if (paymentData.status === "FAILED") {
            setPaymentStatus("failed");
            setError("決済が失敗しました");
          } else {
            // その他のステータス (CREATED, REFUNDED など)
            setPaymentStatus(paymentData.status.toLowerCase());
            setOrderDetails(paymentData);
          }
        } else {
          throw new Error(result.error || "決済状態の確認に失敗しました");
        }
      } catch (err) {
        console.error("Payment status check error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "決済確認中にエラーが発生しました"
        );
        setPaymentStatus("error");
      }
    }

    checkPaymentStatus();

    // 決済が完了していない場合は定期的に状態をチェック
    const intervalId = setInterval(() => {
      if (paymentStatus !== "completed" && paymentStatus !== "error") {
        checkPaymentStatus();
      }
    }, 5000); // 5秒ごとに確認

    return () => clearInterval(intervalId);
  }, [paymentId, merchantPaymentId, status, paymentStatus, searchParams]);

  // セッションストレージをクリアして注文一覧ページに戻る
  const handleViewOrders = () => {
    // 完了したらストレージをクリア
    sessionStorage.removeItem("pendingPaymentId");
    sessionStorage.removeItem("pendingOrderId");
    sessionStorage.removeItem("current_order");

    router.push("/orders");
  };

  // ホームに戻る
  const handleReturnHome = () => {
    // ストレージをクリア
    sessionStorage.removeItem("pendingPaymentId");
    sessionStorage.removeItem("pendingOrderId");
    sessionStorage.removeItem("current_order");

    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="決済結果" showBackButton={false} />

      <main className="flex-grow p-4">
        <Card>
          <CardContent className="p-6">
            {paymentStatus === "checking" && (
              <div className="text-center py-8">
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">決済状態を確認中...</h2>
                <p className="text-muted-foreground">しばらくお待ちください</p>
              </div>
            )}

            {paymentStatus === "completed" && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-4">決済が完了しました！</h2>

                <div className="mb-6 text-left">
                  <p className="mb-2">
                    <span className="font-medium">注文番号:</span>{" "}
                    {orderDetails?.merchantPaymentId}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">決済金額:</span>{" "}
                    {orderDetails?.amount?.amount}円
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    受け取り用QRコード
                  </h3>
                  <div
                    className="bg-white p-4 rounded-lg shadow-sm mx-auto"
                    style={{ maxWidth: "250px" }}
                  >
                    <QrCodeDisplay
                      orderId={orderDetails?.merchantPaymentId || ""}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    このQRコードをカウンターでご提示ください
                  </p>
                </div>

                <div className="space-y-3 mt-6">
                  <Button onClick={handleViewOrders} className="w-full">
                    注文履歴を見る
                  </Button>
                  <Button
                    onClick={handleReturnHome}
                    variant="outline"
                    className="w-full"
                  >
                    ホームに戻る
                  </Button>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="text-center py-8">
                <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-4">決済が失敗しました</h2>
                <p className="text-muted-foreground mb-6">{error}</p>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/checkout")}
                    className="w-full"
                  >
                    注文画面に戻る
                  </Button>
                  <Button
                    onClick={handleReturnHome}
                    variant="outline"
                    className="w-full"
                  >
                    ホームに戻る
                  </Button>
                </div>
              </div>
            )}

            {paymentStatus === "error" && (
              <div className="text-center py-8">
                <AlertTriangle className="h-24 w-24 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
                <p className="text-muted-foreground mb-6">{error}</p>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/checkout")}
                    className="w-full"
                  >
                    注文画面に戻る
                  </Button>
                  <Button
                    onClick={handleReturnHome}
                    variant="outline"
                    className="w-full"
                  >
                    ホームに戻る
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
