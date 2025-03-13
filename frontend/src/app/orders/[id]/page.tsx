"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCodeDisplay } from "@/components/menu/qr-code-display";
import { OrderDetails } from "@/components/menu/order-details";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

// 注文詳細の型定義
interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentId?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const unwrapParams = use(params);
  const orderId = unwrapParams.id
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentChecking, setIsPaymentChecking] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // URL検索パラメータからPayPay関連の情報を取得
  // merchantPaymentIdがURLパラメータになければorderId（URL path）を使用
  const merchantPaymentId = searchParams.get('merchantPaymentId') || orderId;
  const status = searchParams.get('status');

  // 注文データの取得
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        
        // merchantPaymentIdを使って注文データを取得
        console.log(`注文データを取得: merchantPaymentId=${merchantPaymentId}`);
        
        const response = await fetch(`/api/orders/${merchantPaymentId}`);
        if (!response.ok) throw new Error('注文データの取得に失敗しました');
        const responseData = await response.json();
        console.log("APIレスポンス:", responseData);
        
        // APIのレスポンス形式を注文オブジェクト形式に変換
        if (responseData.status === "success" && responseData.data) {
          const apiData = responseData.data;

          // orderItemsから注文内容項目を構築
          const orderItems = apiData.orderItems ? apiData.orderItems.map((item: any, index: number) => ({
            id: `item-${index}`, // ユニークIDを生成
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice.amount
          })) : [];
          
          const transformedOrder: Order = {
            id: apiData.merchantPaymentId,
            status: 'created', // デフォルトステータス
            totalAmount: apiData.amount.amount,
            paymentId: apiData.paymentId,
            items: orderItems,
            createdAt: new Date().toISOString() // 現在時刻をデフォルトに
          };
          
          setOrder(transformedOrder);
        } else {
          throw new Error('注文データのフォーマットが正しくありません');
        }

        setIsLoading(false);
        
        // 常に決済状態を確認（merchantPaymentIdを使用）
        checkPaymentStatus(merchantPaymentId);
      } catch (err) {
        console.error('注文データ取得エラー:', err);
        setError(err instanceof Error ? err.message : '注文データの取得に失敗しました');
        setIsLoading(false);
      }
    };

    if (merchantPaymentId) {
      fetchOrderDetails();
    } else {
      setError('注文情報が見つかりません');
      setIsLoading(false);
    }
  }, [merchantPaymentId]);

  // PayPay決済状態の確認
  const checkPaymentStatus = async (merchantPaymentId: string) => {
    try {
      setIsPaymentChecking(true);
      
      // 決済状態確認API呼び出し
      const response = await fetch(`/api/payment-status?merchantPaymentId=${merchantPaymentId}`);
      if (!response.ok) throw new Error('決済状態の確認に失敗しました');
      
      const result = await response.json();
      console.log('決済状態確認結果:', result);
      
      if (result.status === 'success') {
        const paymentData = result.data;
        
        // 注文状態の更新
        if (paymentData.status === 'COMPLETED') {
          // 注文状態更新API呼び出し
          await fetch('/api/update-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: merchantPaymentId, // merchantPaymentIdを使用
              paymentId: paymentData.paymentId,
              status: 'paid'
            }),
          });
          
          // 注文データを更新
          setOrder(prev => prev ? {
            ...prev,
            status: 'paid',
            paymentId: paymentData.paymentId
          } : null);
        }
      }
    } catch (err) {
      console.error('決済状態確認エラー:', err);
    } finally {
      setIsPaymentChecking(false);
    }
  };

  // ステータスに基づいたラベルとカラーの取得
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: '支払い完了', color: 'text-green-500' };
      case 'preparing':
        return { label: '調理中', color: 'text-amber-500' };
      case 'ready':
        return { label: '受け取り可能', color: 'text-blue-500' };
      case 'completed':
        return { label: '受け取り済み', color: 'text-gray-500' };
      case 'cancelled':
        return { label: 'キャンセル', color: 'text-red-500' };
      default:
        return { label: '注文受付', color: 'text-purple-500' };
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="注文詳細"
        showBackButton={true}
        onBackClick={() => router.push('/orders')}
      />

      <main className="flex-grow p-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/orders')} className="w-full">
                注文一覧に戻る
              </Button>
            </CardContent>
          </Card>
        ) : order ? (
          <>
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">注文 #{order.id.slice(-6)}</h2>
                  <div className={`font-medium ${getStatusInfo(order.status).color}`}>
                    {getStatusInfo(order.status).label}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  注文日時: {new Date(order.createdAt).toLocaleString('ja-JP')}
                </p>

                <OrderDetails items={order.items || []} total={order.totalAmount || 0} />
              </CardContent>
            </Card>

            {/* 決済状態の確認中 */}
            {isPaymentChecking && (
              <Card className="mb-4">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">決済状態を確認しています...</p>
                </CardContent>
              </Card>
            )}

            {/* 支払い完了の場合はQRコード表示 */}
            {order.status === 'paid' && (
              <Card className="mb-4">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
                  <h2 className="text-lg font-bold mb-4">受け取り用QRコード</h2>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm mx-auto" style={{ maxWidth: '250px' }}>
                    <QrCodeDisplay orderId={order.id} />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    このQRコードをカウンターでご提示ください
                  </p>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => router.push('/orders')}
              variant="outline"
              className="w-full mb-4"
            >
              注文一覧に戻る
            </Button>

            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              ホームに戻る
            </Button>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}