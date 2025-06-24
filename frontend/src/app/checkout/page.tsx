"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartItemList } from "@/components/cart/cart-item-list";
import { OrderSummary } from "@/components/menu/order-summary";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";
import { CartItem } from "@/types/utils";

// 合計金額の計算
const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => {
    const optionsPrice = item.options
      ? item.options.reduce((optSum, opt) => optSum + opt.price, 0)
      : 0;
    return sum + (item.price + optionsPrice) * item.quantity;
  }, 0);
};

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = calculateSubtotal(items);
  // 実際のアプリでは送料や割引などが加わる可能性がある
  const total = subtotal;

  // 注文ID生成ヘルパー関数
  const generateOrderId = (): string => {
    return `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("カートに商品がありません");
      return;
    }

    try {
      setIsSubmitting(true);

      // 注文IDの生成
      const orderId = generateOrderId();

      // 注文作成APIを呼び出し
      const response = await fetch(
        `/api/orders/${orderId}?notes=${encodeURIComponent(notes)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(items),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "注文の作成に失敗しました");
      }

      const data = await response.json();

      // 注文情報をセッションストレージに保存して決済完了ページで利用できるようにする
      sessionStorage.setItem(
        "current_order",
        JSON.stringify({
          orderId: data.orderId,
          totalAmount: data.totalAmount,
          items: items,
        })
      );

      // PayPay決済APIを呼び出し
      const paymentResponse = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: data.orderId,
          amount: data.totalAmount,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          description: `Gakushoku GO 注文 #${data.orderId}`,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || "決済の開始に失敗しました");
      }

      const paymentData = await paymentResponse.json();

      if (paymentData.status !== "success" || !paymentData.data) {
        throw new Error(paymentData.error || "決済の開始に失敗しました");
      }

      // 決済情報をセッションストレージに保存（状態確認用）
      sessionStorage.setItem("pendingPaymentId", paymentData.data.paymentId);
      sessionStorage.setItem("pendingOrderId", data.orderId);

      toast.success("注文を作成しました。決済を開始します。");

      // カートをクリア
      clearCart();

      // PayPayアプリを起動するためのディープリンクを使用
      // モバイルデバイスの場合はPayPayアプリが起動
      window.location.href = paymentData.data.deeplink;

      // デスクトップやアプリがない場合のフォールバック（3秒後）
      setTimeout(() => {
        // ブラウザでQRコード表示ページに遷移
        window.location.href = paymentData.data.url;
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("注文処理エラー:", error);
      toast.error(error.message || "注文処理中にエラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        showBackButton={true}
        title="注文確認"
        onBackClick={() => router.back()}
      />

      <main className="flex-grow p-4">
        {/* カート内の商品一覧 */}
        <CartItemList items={items} />

        {/* 注文概要 */}
        <OrderSummary subtotal={subtotal} total={total} />

        {/* 特記事項入力 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Label htmlFor="notes" className="text-lg font-semibold block mb-2">
              特記事項
            </Label>
            <Textarea
              id="notes"
              placeholder="アレルギーや調理の要望があればこちらにご記入ください"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* 決済ボタン */}
        <Button
          className="w-full h-12 text-lg mb-4"
          disabled={isSubmitting || items.length === 0}
          onClick={handleSubmit}
        >
          {isSubmitting ? "処理中..." : "決済へ進む"}
        </Button>

        {/* 注意事項 */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>※注文確定後のキャンセルはできません。</p>
          <p>
            ※商品の準備ができましたら、QRコードをカウンターでご提示ください。
          </p>
          <p>※アレルギー等の特記事項は必ずご記入ください。</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
