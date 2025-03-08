'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 注文アイテムの型定義
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// 注文データの型定義
interface Order {
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
}

// PayPay決済テストページ
export default function PaymentTestPage() {
  // テスト用の注文データを作成
  const [testOrder, setTestOrder] = useState<Order>({
    orderNumber: `TEST-${Date.now()}`,
    items: [
      {
        id: 'test-item-1',
        name: 'テスト商品 1円',
        quantity: 1,
        price: 1
      }
    ],
    totalAmount: 1 // 1円で設定
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 注文ID生成ヘルパー関数
  const generateOrderId = (): string => {
    return `TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  // PayPay決済処理開始
  const handlePaymentRequest = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // サンプル注文データ
      const orderData = {
        orderId: generateOrderId(),
        amount: testOrder.totalAmount,
        items: testOrder.items,
        description: '学食注文テスト #' + testOrder.orderNumber
      };

      console.log('送信データ:', orderData);

      // サーバーサイドAPIを呼び出し、PayPayのQRコード情報を取得
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('APIレスポンス:', result);

      if (result.status === 'success') {
        // 決済情報をローカルストレージに保存（状態確認用）
        // 注: pendingPaymentId は PayPay の決済ID
        // 注: pendingOrderId は merchantPaymentId として使用
        localStorage.setItem('pendingPaymentId', result.data.paymentId);
        localStorage.setItem('pendingOrderId', orderData.orderId);

        // デバッグ用にストレージ内容確認
        console.log('ローカルストレージ保存内容:', {
          pendingPaymentId: localStorage.getItem('pendingPaymentId'),
          pendingOrderId: localStorage.getItem('pendingOrderId')
        });

        // PayPayアプリを起動するためのディープリンクを使用
        // モバイルデバイスの場合はPayPayアプリが起動
        window.location.href = result.data.deeplink;

        // デスクトップやアプリがない場合のフォールバック（5秒後）
        setTimeout(() => {
          // ブラウザでQRコード表示ページに遷移
          window.location.href = result.data.url;
        }, 5000);
      } else {
        throw new Error(result.error || '決済リクエストに失敗しました');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : '決済処理中にエラーが発生しました');
      setIsProcessing(false);
    }
  };

  return (
    <div className="test-payment-container">
      <h1>PayPay決済テスト</h1>

      <div className="test-order-details">
        <h2>テスト注文詳細</h2>
        <div className="order-info">
          <p><strong>注文番号:</strong> {testOrder.orderNumber}</p>
          <p><strong>合計金額:</strong> {testOrder.totalAmount}円</p>

          <h3>注文商品:</h3>
          <ul>
            {testOrder.items.map(item => (
              <li key={item.id}>
                {item.name} - {item.price}円 × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="payment-action">
        <button
          onClick={handlePaymentRequest}
          disabled={isProcessing}
          className={`payment-button ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? '処理中...' : 'PayPay決済テスト (1円)'}
        </button>

        {error && (
          <div className="error-message">
            エラー: {error}
          </div>
        )}
      </div>

      <div className="debug-info">
        <h3>デバッグ情報</h3>
        <p>このページは決済テスト専用です。1円での決済処理を実行できます。</p>
        <p>決済フローが完了すると、完了画面にリダイレクトされます。</p>
      </div>

      <style jsx>{`
        .test-payment-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        
        h1 {
          color: #333;
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .test-order-details {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .order-info {
          margin-top: 15px;
        }
        
        .order-info ul {
          padding-left: 20px;
        }
        
        .order-info li {
          margin-bottom: 8px;
        }
        
        .payment-action {
          margin: 30px 0;
        }
        
        .payment-button {
          background-color: #ff0033;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 15px 30px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
          width: 100%;
        }
        
        .payment-button:hover {
          background-color: #e60030;
        }
        
        .payment-button.processing {
          background-color: #888;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #ff0033;
          margin-top: 15px;
          padding: 10px;
          background-color: #fff5f5;
          border-radius: 4px;
          border-left: 4px solid #ff0033;
        }
        
        .debug-info {
          margin-top: 40px;
          padding: 15px;
          background-color: #f0f7ff;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .debug-info h3 {
          margin-top: 0;
          color: #0066cc;
        }
      `}</style>
    </div>
  );
}