// app/orders/completion/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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

export default function OrderCompletionPage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('checking');
  const [orderDetails, setOrderDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // URLからPayPay関連のパラメータを取得
  const paymentId = searchParams.get('paymentId');
  const merchantPaymentId = searchParams.get('merchantPaymentId');
  const status = searchParams.get('status');

  useEffect(() => {
    async function checkPaymentStatus() {
      // デバッグ情報を出力
      console.log('URL Parameters:', {
        paymentId,
        merchantPaymentId,
        status,
        allParams: Object.fromEntries(searchParams.entries())
      });

      console.log('LocalStorage Data:', {
        pendingPaymentId: localStorage.getItem('pendingPaymentId'),
        pendingOrderId: localStorage.getItem('pendingOrderId')
      });

      // パラメータがない場合はローカルストレージから取得
      const pendingPaymentId = localStorage.getItem('pendingPaymentId');
      const pendingOrderId = localStorage.getItem('pendingOrderId');

      // merchantPaymentId を優先的に使用
      const merchantPaymentIdToCheck = merchantPaymentId || pendingOrderId;

      if (!merchantPaymentIdToCheck) {
        setError('注文IDが見つかりません');
        setPaymentStatus('error');
        return;
      }

      try {
        console.log(`決済状態確認中: merchantPaymentId=${merchantPaymentIdToCheck}`);

        // サーバーに決済状態を問い合わせる
        const response = await fetch(`/api/payment-status?merchantPaymentId=${merchantPaymentIdToCheck}`);

        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('決済状態確認結果:', result);

        if (result.status === 'success') {
          const paymentData = result.data as PaymentDetails;

          // 決済状態に応じた処理
          if (paymentData.status === 'COMPLETED') {
            setPaymentStatus('completed');
            setOrderDetails(paymentData);

            // 完了したらストレージをクリア
            localStorage.removeItem('pendingPaymentId');
            localStorage.removeItem('pendingOrderId');

            // 注文データを更新するAPI呼び出し
            await fetch('/api/update-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: merchantPaymentIdToCheck,
                paymentId: paymentData.paymentId,
                status: 'paid'
              }),
            });

          } else if (paymentData.status === 'AUTHORIZED') {
            setPaymentStatus('authorized');
            setOrderDetails(paymentData);
          } else if (paymentData.status === 'FAILED') {
            setPaymentStatus('failed');
            setError('決済が失敗しました');
          } else {
            // その他のステータス (CREATED, REFUNDED など)
            setPaymentStatus(paymentData.status.toLowerCase());
            setOrderDetails(paymentData);
          }
        } else {
          throw new Error(result.error || '決済状態の確認に失敗しました');
        }
      } catch (err) {
        console.error('Payment status check error:', err);
        setError(err instanceof Error ? err.message : '決済確認中にエラーが発生しました');
        setPaymentStatus('error');
      }
    }

    checkPaymentStatus();

    // 決済が完了していない場合は定期的に状態をチェック
    const intervalId = setInterval(() => {
      if (paymentStatus !== 'completed' && paymentStatus !== 'error') {
        checkPaymentStatus();
      }
    }, 5000); // 5秒ごとに確認

    return () => clearInterval(intervalId);
  }, [paymentId, merchantPaymentId, status, paymentStatus, searchParams]);

  const handleReturnToHome = () => {
    router.push('/');
  };

  return (
    <div className="order-completion-container">
      <h1>注文処理状況</h1>

      {paymentStatus === 'checking' && (
        <div className="status-checking">
          <p>決済状態を確認中です...</p>
          <div className="loading-spinner"></div>
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="status-completed">
          <h2>テスト決済完了!</h2>
          <div className="order-details">
            <p>注文ID: {orderDetails?.merchantPaymentId || '---'}</p>
            <p>決済ID: {orderDetails?.paymentId || '---'}</p>
            <p>決済金額: {orderDetails?.amount?.amount || 0}円</p>
            <p>決済説明: {orderDetails?.orderDescription || '---'}</p>

            {/* ここに実際のアプリではQRコード表示が入る */}
            <div className="qr-code-placeholder">
              <p>テスト環境では注文確認QRコードは表示されません</p>
            </div>

            <div className="debug-info">
              <h3>デバッグ情報</h3>
              <p>支払い状態: {paymentStatus}</p>
              <p>処理内容: テスト決済の完了確認</p>
              <p>注: 実際の環境では、この画面で受け取り用QRコードが表示されます</p>
            </div>

            <button onClick={handleReturnToHome} className="return-button">
              テストページに戻る
            </button>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="status-failed">
          <h2>決済が失敗しました</h2>
          <p>{error}</p>
          <button onClick={handleReturnToHome} className="return-button">
            テストページに戻る
          </button>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="status-error">
          <h2>エラーが発生しました</h2>
          <p>{error}</p>
          <button onClick={handleReturnToHome} className="return-button">
            テストページに戻る
          </button>
        </div>
      )}

      {/* スタイルは以前と同じなので省略 */}
      <style jsx>{`
        .order-completion-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }
        
        .status-checking, .status-completed, .status-failed, .status-error {
          padding: 20px;
          border-radius: 8px;
          background-color: #f9f9f9;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .status-completed {
          border-left: 4px solid #4CAF50;
        }
        
        .status-failed, .status-error {
          border-left: 4px solid #F44336;
        }
        
        .loading-spinner {
          margin: 20px auto;
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .order-details {
          margin-top: 20px;
        }
        
        .qr-code-placeholder {
          margin: 20px auto;
          padding: 40px;
          background-color: #eee;
          border-radius: 4px;
          text-align: center;
        }
        
        .debug-info {
          margin: 20px 0;
          padding: 15px;
          background-color: #f0f7ff;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .debug-info h3 {
          margin-top: 0;
          color: #0066cc;
        }
        
        .return-button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: block;
          width: 100%;
          font-size: 16px;
        }
        
        .return-button:hover {
          background-color: #3e8e41;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}