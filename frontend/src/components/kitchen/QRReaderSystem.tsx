// src/components/kitchen/QRReaderSystem.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Printer,
  CheckCircle,
  XCircle,
  Power,
  Keyboard,
} from "lucide-react";
import QrScanner from "qr-scanner";
import { Label } from "../ui/label";

interface OrderItem {
  menuId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface OrderData {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderTime: string;
  qrValidUntil: string;
  specialInstructions?: string;
}

interface PrinterStatus {
  connected: boolean;
  ready: boolean;
  error?: string;
}

export default function QRReaderSystem() {
  // プリンター関連
  const [printer, setPrinter] = useState<any>(null);
  const [ePosDev, setEPosDev] = useState<any>(null);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus>({
    connected: false,
    ready: false,
  });
  const [printerIP, setPrinterIP] = useState("192.168.11.3");
  const [printerPort, setPrinterPort] = useState(8008);

  // QRコード読み取り関連
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [qrStatus, setQrStatus] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // 注文データ関連
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [lastProcessedQR, setLastProcessedQR] = useState<string>("");
  const [printHistory, setPrintHistory] = useState<string[]>([]);

  const [manualOrderId, setManualOrderId] = useState("");
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const printNumberRef = useRef(1);

  // EPSONライブラリの読み込み
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/libs/epson/epos-2.27.0.js";
    script.async = true;
    script.onload = () => {
      console.log("EPSON ePOS SDK loaded");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // プリンター接続
  const connectPrinter = async () => {
    try {
      setPrinterStatus((prev) => ({ ...prev, error: undefined }));

      const device = new (window as any).epson.ePOSDevice();
      setEPosDev(device);

      device.connect(printerIP, printerPort, (data: string) => {
        if (data === "OK" || data === "SSL_CONNECT_OK") {
          device.createDevice(
            "local_printer",
            device.DEVICE_TYPE_PRINTER,
            { crypto: false, buffer: false },
            (devobj: any, retcode: string) => {
              if (retcode === "OK") {
                devobj.timeout = 60000;
                // プリンター接続の部分で、onreceiveコールバックを修正
                devobj.onreceive = (res: any) => {
                  if (res.success) {
                    setQrStatus("印刷完了！5秒後にカメラを再起動します");
                    if (currentOrder) {
                      setPrintHistory((prev) => [
                        ...prev,
                        currentOrder.orderId,
                      ]);
                    }
                    setTimeout(() => {
                      setIsProcessing(false);
                      startCamera();
                    }, 5000);
                  } else {
                    setQrStatus("印刷に失敗しました");
                    setTimeout(() => {
                      setIsProcessing(false);
                      startCamera();
                    }, 3000);
                  }
                };
                devobj.oncoveropen = () => {
                  setPrinterStatus((prev) => ({
                    ...prev,
                    error: "プリンターカバーが開いています",
                  }));
                };
                devobj.onpaperok = () => {
                  setPrinterStatus((prev) => ({ ...prev, error: undefined }));
                };
                devobj.onpaperend = () => {
                  setPrinterStatus((prev) => ({
                    ...prev,
                    error: "用紙がありません",
                  }));
                };

                setPrinter(devobj);
                setPrinterStatus({ connected: true, ready: true });
              } else {
                setPrinterStatus({
                  connected: false,
                  ready: false,
                  error: `デバイス作成失敗: ${retcode}`,
                });
              }
            }
          );
        } else {
          setPrinterStatus({
            connected: false,
            ready: false,
            error: `接続失敗: ${data}`,
          });
        }
      });
    } catch (error) {
      setPrinterStatus({
        connected: false,
        ready: false,
        error: `接続エラー: ${error}`,
      });
    }
  };

  // カメラ開始
  const startCamera = async () => {
    if (!videoRef.current || isProcessing) return; // isProcessingチェックを追加

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result: any) => handleQRCode(result.data),
        {
          highlightScanRegion: false,
          highlightCodeOutline: true,
          maxScansPerSecond: 0.5,
        }
      );

      await scanner.start();
      setQrScanner(scanner);
      setCameraActive(true);
      setQrStatus("QRコードをカメラに向けてください");
    } catch (error) {
      setQrStatus(`カメラ開始エラー: ${error}`);
    }
  };

  // カメラ停止
  const stopCamera = () => {
    if (qrScanner) {
      qrScanner.stop();
      setQrScanner(null);
    }
    setCameraActive(false);
    setQrStatus("");
  };

  // QRコード処理（簡素化版）
  const handleQRCode = async (qrData: string) => {
    if (qrData === lastProcessedQR || isProcessing) return;

    setIsProcessing(true); // この行を追加

    // カメラ停止
    if (qrScanner) {
      qrScanner.stop();
      setCameraActive(false);
    }

    setLastProcessedQR(qrData);
    setQrStatus("注文データを取得中...");

    try {
      const orderData = await parseQRData(qrData);

      if (printHistory.includes(orderData.orderId)) {
        setQrStatus("この注文は既に印刷済みです");
        setTimeout(() => {
          setIsProcessing(false);
          startCamera();
        }, 3000);
        return;
      }

      setCurrentOrder(orderData);
      setQrStatus("印刷を開始します...");

      if (printer && printerStatus.ready) {
        printOrderDirect(orderData);
      } else {
        setQrStatus("プリンターが準備できていません");
        setTimeout(() => {
          setIsProcessing(false);
          startCamera();
        }, 3000);
      }
    } catch (error) {
      setQrStatus(`エラー: ${error}`);
      setTimeout(() => {
        setIsProcessing(false);
        startCamera();
      }, 3000);
    }
  };

  const parseQRData = async (qrData: string): Promise<OrderData> => {
    try {
      if (qrData.startsWith("{")) {
        const data = JSON.parse(qrData);

        // 既存の完全なデータ形式をチェック
        if (data.orderId && data.items && Array.isArray(data.items)) {
          return data;
        }

        // qr-code-display.tsx の形式に対応 - APIから取得
        if (data.id && data.type === "order") {
          return await fetchOrderData(data.id);
        }

        throw new Error("サポートされていないQRコード形式です");
      }

      // 文字列の場合は注文IDとしてAPIから取得
      return await fetchOrderData(qrData);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("サポートされていない")
      ) {
        throw error;
      }
      throw new Error("QRコードの解析に失敗しました");
    }
  };

  // 印刷実行
  const printOrder = () => {
    if (!printer || !currentOrder) {
      setQrStatus("プリンターまたは注文データがありません");
      return;
    }

    // 印刷番号を取得
    const printNumber = getNextPrintNumber();

    try {
      // 伝票印刷フォーマット（要件RC-05）
      printer.addTextLang("ja");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText("【 学食注文伝票 】\n");
      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      // 印刷番号を追加
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText(`No.${printNumber.toString().padStart(2, "0")}\n`);
      printer.addTextSize(1, 1);
      printer.addText("\n");

      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText(`注文ID: ${currentOrder.orderId}\n`);
      printer.addText(`注文時刻:  ${new Date().toLocaleString("ja-JP")}\n`);

      // 注文内容
      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText("【 注文内容 】\n");
      printer.addTextStyle(false, false, false, printer.COLOR_1);
      printer.addText("--------------------------------\n");

      currentOrder.items.forEach((item, index) => {
        printer.addText(`${index + 1}. ${item.name}\n`);
        printer.addText(
          `   数量: ${item.quantity} × ¥${item.unitPrice} = ¥${item.totalPrice}\n`
        );
        if (item.notes) {
          printer.addText(`   備考: ${item.notes}\n`);
        }
        printer.addText("\n");
      });

      printer.addText("--------------------------------\n");
      printer.addTextSize(1, 2);
      printer.addText(`合計: ¥${currentOrder.totalAmount}\n`);
      printer.addTextSize(1, 1);

      // 特記事項
      if (currentOrder.specialInstructions) {
        printer.addText("\n【 特記事項 】\n");
        printer.addText(`${currentOrder.specialInstructions}\n`);
      }

      printer.addText("\n");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText("調理完了後、お客様をお呼びください\n");

      printer.addCut(printer.CUT_FEED);

      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText("【 学食注文伝票 】\n");
      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      // 印刷番号を追加
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText(`No.${printNumber.toString().padStart(2, "0")}\n`);
      printer.addTextSize(1, 1);
      printer.addText("\n");

      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText(`注文ID: ${currentOrder.orderId}\n`);
      printer.addText(`注文時刻:  ${new Date().toLocaleString("ja-JP")}\n`);

      // 注文内容
      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText("【 注文内容 】\n");
      printer.addTextStyle(false, false, false, printer.COLOR_1);
      printer.addText("--------------------------------\n");

      currentOrder.items.forEach((item, index) => {
        printer.addText(`${index + 1}. ${item.name}\n`);
        printer.addText(
          `   数量: ${item.quantity} × ¥${item.unitPrice} = ¥${item.totalPrice}\n`
        );
        if (item.notes) {
          printer.addText(`   備考: ${item.notes}\n`);
        }
        printer.addText("\n");
      });

      printer.addText("--------------------------------\n");
      printer.addTextSize(1, 2);
      printer.addText(`合計: ¥${currentOrder.totalAmount}\n`);
      printer.addTextSize(1, 1);

      // 特記事項
      if (currentOrder.specialInstructions) {
        printer.addText("\n【 特記事項 】\n");
        printer.addText(`${currentOrder.specialInstructions}\n`);
      }

      printer.addText("\n");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText("調理完了後、お客様をお呼びください\n");

      printer.addCut(printer.CUT_FEED);
      printer.send();

      setQrStatus("印刷を開始しました...");
    } catch (error) {
      setQrStatus(`印刷エラー: ${error}`);
    }
  };

  // 直接データを受け取る印刷関数
  const printOrderDirect = (orderData: OrderData) => {
    if (!printer) {
      setQrStatus("プリンターが接続されていません");
      return;
    }

    // 印刷番号を取得
    const printNumber = getNextPrintNumber();
    console.log(printNumber);

    try {
      // 印刷処理のみ（履歴追加処理を削除）
      printer.addTextLang("ja");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText("【 学食注文伝票 】\n");
      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      // 印刷番号を追加
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText(`No.${printNumber.toString().padStart(2, "0")}\n`);
      printer.addTextSize(1, 1);
      printer.addText("\n");

      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText(`注文ID: ${orderData.orderId}\n`);
      printer.addText(`注文時刻:  ${new Date().toLocaleString("ja-JP")}\n`);

      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText("【 注文内容 】\n");
      printer.addTextStyle(false, false, false, printer.COLOR_1);
      printer.addText("--------------------------------\n");

      orderData.items.forEach((item, index) => {
        printer.addText(`${index + 1}. ${item.name}\n`);
        printer.addText(
          `   数量: ${item.quantity} × ¥${item.unitPrice} = ¥${item.totalPrice}\n`
        );
        if (item.notes) {
          printer.addText(`   備考: ${item.notes}\n`);
        }
        printer.addText("\n");
      });

      printer.addText("--------------------------------\n");
      printer.addTextSize(1, 2);
      printer.addText(`合計: ¥${orderData.totalAmount}\n`);
      printer.addTextSize(1, 1);

      if (orderData.specialInstructions) {
        printer.addText("\n【 特記事項 】\n");
        printer.addText(`${orderData.specialInstructions}\n`);
      }

      printer.addCut(printer.CUT_FEED);

      // 印刷処理のみ（履歴追加処理を削除）
      printer.addTextLang("ja");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText("【 学食注文伝票 】\n");
      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      // 印刷番号を追加
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText(`No.${printNumber.toString().padStart(2, "0")}\n`);
      printer.addTextSize(1, 1);
      printer.addText("\n");

      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText(`注文ID: ${orderData.orderId}\n`);
      printer.addText(`注文時刻:  ${new Date().toLocaleString("ja-JP")}\n`);

      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText("【 注文内容 】\n");
      printer.addTextStyle(false, false, false, printer.COLOR_1);
      printer.addText("--------------------------------\n");

      orderData.items.forEach((item, index) => {
        printer.addText(`${index + 1}. ${item.name}\n`);
        printer.addText(
          `   数量: ${item.quantity} × ¥${item.unitPrice} = ¥${item.totalPrice}\n`
        );
        if (item.notes) {
          printer.addText(`   備考: ${item.notes}\n`);
        }
        printer.addText("\n");
      });

      printer.addText("--------------------------------\n");
      printer.addTextSize(1, 2);
      printer.addText(`合計: ¥${orderData.totalAmount}\n`);
      printer.addTextSize(1, 1);

      if (orderData.specialInstructions) {
        printer.addText("\n【 特記事項 】\n");
        printer.addText(`${orderData.specialInstructions}\n`);
      }

      printer.addCut(printer.CUT_FEED);
      printer.send();

      setQrStatus("印刷を開始しました...");
    } catch (error) {
      setQrStatus(`印刷エラー: ${error}`);
    }
  };

  // OrderData取得
  const fetchOrderData = async (
    merchantPaymentId: string
  ): Promise<OrderData> => {
    setLoadingOrder(true);
    try {
      console.log(`注文データを取得: merchantPaymentId=${merchantPaymentId}`);

      const response = await fetch(`/api/orders/${merchantPaymentId}`);

      if (!response.ok) {
        throw new Error(`注文が見つかりません: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("APIレスポンス:", responseData);

      if (responseData.status !== "success" || !responseData.data) {
        throw new Error("注文データのフォーマットが正しくありません");
      }

      const apiData = responseData.data;

      // orderItemsから注文内容項目を構築
      const orderItems = apiData.orderItems
        ? apiData.orderItems.map((item: any) => ({
            menuId: item.menuId || "UNKNOWN",
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice.amount,
            totalPrice: item.unitPrice.amount * item.quantity,
            notes: item.notes,
          }))
        : [];

      // 決済状態も確認
      const paymentStatus = await checkPaymentStatus(merchantPaymentId);

      return {
        orderId: apiData.merchantPaymentId,
        items: orderItems,
        totalAmount: apiData.amount.amount,
        paymentStatus: paymentStatus,
        orderTime: apiData.createdAt || new Date().toISOString(),
        qrValidUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        specialInstructions: apiData.notes,
      };
    } catch (error) {
      console.error("注文データ取得エラー:", error);
      throw new Error(`注文データの取得に失敗しました: ${error}`);
    } finally {
      setLoadingOrder(false);
    }
  };

  // PayPay決済状態確認関数を追加
  const checkPaymentStatus = async (
    merchantPaymentId: string
  ): Promise<string> => {
    try {
      const response = await fetch(
        `/api/payment-status?merchantPaymentId=${merchantPaymentId}`
      );
      if (!response.ok) return "unknown";

      const result = await response.json();
      console.log("決済状態確認結果:", result);

      if (result.status === "success" && result.data) {
        const paymentData = result.data;
        return paymentData.status === "COMPLETED" ? "paid" : "pending";
      }

      return "unknown";
    } catch (error) {
      console.error("決済状態確認エラー:", error);
      return "unknown";
    }
  };

  // 手動入力処理関数を追加
  const handleManualInput = async () => {
    if (!manualOrderId.trim()) {
      setQrStatus("注文IDを入力してください");
      return;
    }

    try {
      setQrStatus("注文データを取得中...");
      const orderData = await fetchOrderData(manualOrderId.trim());

      if (printHistory.includes(orderData.orderId)) {
        setQrStatus("この注文は既に印刷済みです");
        setManualInputOpen(false);
        return;
      }

      setCurrentOrder(orderData);
      setQrStatus("注文データを取得しました");
      setManualInputOpen(false);
      setManualOrderId("");
    } catch (error) {
      setQrStatus(`エラー: ${error}`);
    }
  };

  const getNextPrintNumber = () => {
    const nextNumber = printNumberRef.current;
    printNumberRef.current =
      printNumberRef.current >= 99 ? 1 : printNumberRef.current + 1;
    return nextNumber;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">QRコード受付システム</h1>
        <Badge variant={printerStatus.ready ? "default" : "destructive"}>
          {printerStatus.ready ? "稼働中" : "停止中"}
        </Badge>
      </div>

      {/* プリンター接続 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            プリンター接続
            {printerStatus.connected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">IPアドレス</label>
              <Input
                value={printerIP}
                onChange={(e) => setPrinterIP(e.target.value)}
                placeholder="192.168.11.3"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ポート</label>
              <Input
                type="number"
                value={printerPort}
                onChange={(e) => setPrinterPort(parseInt(e.target.value))}
                placeholder="8008"
              />
            </div>
          </div>
          <Button
            onClick={connectPrinter}
            disabled={printerStatus.connected}
            className="w-full"
          >
            <Power className="h-4 w-4 mr-2" />
            {printerStatus.connected ? "接続済み" : "接続"}
          </Button>
          {printerStatus.error && (
            <Alert variant="destructive">
              <AlertDescription>{printerStatus.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* QRコード読み取り */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QRコード読み取り
            {cameraActive && <Badge variant="default">稼働中</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-80 h-60 bg-gray-100 rounded-lg object-cover"
                autoPlay
                muted
                playsInline
              />
              {cameraActive && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={startCamera}
              disabled={cameraActive}
              variant="outline"
            >
              カメラ開始
            </Button>
            <Button
              onClick={stopCamera}
              disabled={!cameraActive}
              variant="outline"
            >
              カメラ停止
            </Button>

            {/* 手動入力ボタンを追加 */}
            <Dialog open={manualInputOpen} onOpenChange={setManualInputOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Keyboard className="h-4 w-4 mr-2" />
                  手動入力
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>注文ID 手動入力</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="manual-order-id">注文ID</Label>
                    <Input
                      id="manual-order-id"
                      value={manualOrderId}
                      onChange={(e) => setManualOrderId(e.target.value)}
                      placeholder="ORD20250326001"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleManualInput();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleManualInput}
                      disabled={loadingOrder}
                      className="flex-1"
                    >
                      {loadingOrder ? "取得中..." : "注文データ取得"}
                    </Button>
                    <Button
                      onClick={() => {
                        setManualInputOpen(false);
                        setManualOrderId("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {qrStatus && (
            <Alert>
              <AlertDescription>{qrStatus}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 注文詳細 */}
      {currentOrder && (
        <Card>
          <CardHeader>
            <CardTitle>注文詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>注文ID:</strong> {currentOrder.orderId}
              </div>
              <div>
                <strong>注文時刻:</strong>{" "}
                {new Date(currentOrder.orderTime).toLocaleString("ja-JP")}
              </div>
              <div>
                <strong>決済状況:</strong>
                <Badge
                  variant={
                    currentOrder.paymentStatus === "paid"
                      ? "default"
                      : "destructive"
                  }
                >
                  {currentOrder.paymentStatus === "paid"
                    ? "決済済み"
                    : "未決済"}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">注文内容</h4>
              <div className="space-y-2">
                {currentOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.notes && (
                        <div className="text-xs text-gray-600">
                          {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div>
                        {item.quantity} × ¥{item.unitPrice}
                      </div>
                      <div className="font-semibold">¥{item.totalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-bold">合計金額</span>
              <span className="text-xl font-bold">
                ¥{currentOrder.totalAmount}
              </span>
            </div>

            <Button
              onClick={printOrder}
              disabled={
                !printerStatus.ready ||
                printHistory.includes(currentOrder.orderId)
              }
              className="w-full"
              size="lg"
            >
              {printHistory.includes(currentOrder.orderId)
                ? "印刷済み"
                : "🖨️ 伝票印刷"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
