// src/components/kitchen/PrinterTestSystem.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Printer,
  CheckCircle,
  XCircle,
  Power,
  FileText,
  Zap,
  Settings,
  Activity,
  AlertTriangle,
  Info,
} from "lucide-react";

interface PrinterStatus {
  connected: boolean;
  ready: boolean;
  error?: string;
  lastActivity?: Date;
}

interface PrintTestResult {
  success: boolean;
  message: string;
  timestamp: Date;
  testType: string;
}

export default function PrinterTestSystem() {
  // プリンター関連
  const [printer, setPrinter] = useState<any>(null);
  const [ePosDev, setEPosDev] = useState<any>(null);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus>({
    connected: false,
    ready: false,
  });

  // 接続設定
  const [printerIP, setPrinterIP] = useState("192.168.11.3");
  const [printerPort, setPrinterPort] = useState(8008);
  const [connecting, setConnecting] = useState(false);

  // テスト結果
  const [testResults, setTestResults] = useState<PrintTestResult[]>([]);
  const [customText, setCustomText] = useState(
    "テスト印刷\nHello World!\n学食システム"
  );

  // プリンター詳細情報
  const [printerInfo, setPrinterInfo] = useState<any>({});

  // EPSONライブラリの読み込み確認
  useEffect(() => {
    const checkLibrary = () => {
      if (typeof window !== "undefined" && (window as any).epson) {
        console.log("EPSON ePOS SDK is ready");
      } else {
        console.log("Loading EPSON ePOS SDK...");
        setTimeout(checkLibrary, 1000);
      }
    };
    checkLibrary();
  }, []);

  // テスト結果を追加
  const addTestResult = (
    testType: string,
    success: boolean,
    message: string
  ) => {
    const result: PrintTestResult = {
      success,
      message,
      timestamp: new Date(),
      testType,
    };
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // 最新10件を保持
  };

  // プリンター接続
  const connectPrinter = async () => {
    if (!printerIP.trim()) {
      addTestResult("接続", false, "IPアドレスを入力してください");
      return;
    }

    setConnecting(true);
    setPrinterStatus((prev) => ({ ...prev, error: undefined }));

    try {
      // EPSONライブラリの確認
      if (!(window as any).epson) {
        throw new Error("EPSON ePOS SDKが読み込まれていません");
      }

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
                // プリンターイベントハンドラーの設定
                devobj.timeout = 60000;
                devobj.onreceive = (res: any) => {
                  console.log("Print response:", res);
                  const success = res.success;
                  const message = success
                    ? "印刷が完了しました"
                    : `印刷失敗: ${res.code}`;
                  addTestResult("印刷", success, message);

                  setPrinterStatus((prev) => ({
                    ...prev,
                    lastActivity: new Date(),
                  }));
                };

                devobj.oncoveropen = () => {
                  const message = "プリンターカバーが開いています";
                  setPrinterStatus((prev) => ({ ...prev, error: message }));
                  addTestResult("状態変化", false, message);
                };

                devobj.oncoverok = () => {
                  addTestResult(
                    "状態変化",
                    true,
                    "プリンターカバーが閉じられました"
                  );
                  setPrinterStatus((prev) => ({ ...prev, error: undefined }));
                };

                devobj.onpaperend = () => {
                  const message = "用紙がありません";
                  setPrinterStatus((prev) => ({ ...prev, error: message }));
                  addTestResult("状態変化", false, message);
                };

                devobj.onpaperok = () => {
                  addTestResult("状態変化", true, "用紙が補充されました");
                  setPrinterStatus((prev) => ({ ...prev, error: undefined }));
                };

                devobj.onpapernearend = () => {
                  addTestResult(
                    "状態変化",
                    false,
                    "用紙残量が少なくなっています"
                  );
                };

                setPrinter(devobj);
                setPrinterStatus({
                  connected: true,
                  ready: true,
                  lastActivity: new Date(),
                });
                addTestResult(
                  "接続",
                  true,
                  `プリンターに接続しました (${printerIP}:${printerPort})`
                );
              } else {
                const message = `デバイス作成失敗: ${retcode}`;
                setPrinterStatus({
                  connected: false,
                  ready: false,
                  error: message,
                });
                addTestResult("接続", false, message);
              }
              setConnecting(false);
            }
          );
        } else {
          const message = `接続失敗: ${data}`;
          setPrinterStatus({
            connected: false,
            ready: false,
            error: message,
          });
          addTestResult("接続", false, message);
          setConnecting(false);
        }
      });
    } catch (error) {
      const message = `接続エラー: ${error}`;
      setPrinterStatus({
        connected: false,
        ready: false,
        error: message,
      });
      addTestResult("接続", false, message);
      setConnecting(false);
    }
  };

  // プリンター切断
  const disconnectPrinter = () => {
    if (ePosDev) {
      try {
        ePosDev.disconnect();
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    }

    setPrinter(null);
    setEPosDev(null);
    setPrinterStatus({ connected: false, ready: false });
    addTestResult("切断", true, "プリンターから切断しました");
  };

  // 基本印刷テスト
  const testBasicPrint = () => {
    if (!printer) {
      addTestResult("基本印刷", false, "プリンターが接続されていません");
      return;
    }

    try {
      printer.addTextLang("ja");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 2);
      printer.addText("【 接続テスト 】\n");
      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText("プリンター接続テストが正常に\n完了しました。\n\n");
      printer.addText(`テスト日時: ${new Date().toLocaleString("ja-JP")}\n`);
      printer.addText(`IPアドレス: ${printerIP}\n`);
      printer.addText(`ポート: ${printerPort}\n\n`);

      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText("学食注文システム\n");
      printer.addText("Powered by EPSON ePOS\n\n");

      printer.addCut(printer.CUT_FEED);
      printer.send();

      addTestResult("基本印刷", true, "基本印刷テストを実行しました");
    } catch (error) {
      addTestResult("基本印刷", false, `印刷エラー: ${error}`);
    }
  };

  // 文字エンコーディングテスト
  const testTextEncoding = () => {
    if (!printer) {
      addTestResult("文字テスト", false, "プリンターが接続されていません");
      return;
    }

    try {
      printer.addTextLang("ja");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText("【 文字エンコーディングテスト 】\n\n");

      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText("ひらがな: あいうえお かきくけこ\n");
      printer.addText("カタカナ: アイウエオ カキクケコ\n");
      printer.addText("漢字: 学食注文管理システム\n");
      printer.addText("英数字: ABCabc 123456789\n");
      printer.addText("記号: !@#$%^&*()_+-=[]{}|;:,.<>?\n\n");

      // 特殊文字
      printer.addText("特殊文字テスト:\n");
      printer.addText("■□●○▲△▼▽◆◇★☆\n");
      printer.addText("①②③④⑤⑥⑦⑧⑨⑩\n\n");

      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText(`テスト実行: ${new Date().toLocaleString("ja-JP")}\n\n`);

      printer.addCut(printer.CUT_FEED);
      printer.send();

      addTestResult(
        "文字テスト",
        true,
        "文字エンコーディングテストを実行しました"
      );
    } catch (error) {
      addTestResult("文字テスト", false, `文字テストエラー: ${error}`);
    }
  };

  // フォーマットテスト
  const testFormatting = () => {
    if (!printer) {
      addTestResult("フォーマット", false, "プリンターが接続されていません");
      return;
    }

    try {
      printer.addTextLang("ja");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addTextSize(2, 1);
      printer.addText("【 フォーマットテスト 】\n");
      printer.addTextSize(1, 1);
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      // 左寄せ
      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText("■ 左寄せテキスト\n");

      // 中央寄せ
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText("■ 中央寄せテキスト\n");

      // 右寄せ
      printer.addTextAlign(printer.ALIGN_RIGHT);
      printer.addText("■ 右寄せテキスト\n\n");

      // テキストサイズ
      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addTextSize(1, 1);
      printer.addText("標準サイズ\n");
      printer.addTextSize(2, 1);
      printer.addText("横倍角\n");
      printer.addTextSize(1, 2);
      printer.addText("縦倍角\n");
      printer.addTextSize(2, 2);
      printer.addText("縦横倍角\n");
      printer.addTextSize(1, 1);

      // スタイル
      printer.addText("\n");
      printer.addTextStyle(false, false, true, printer.COLOR_1);
      printer.addText("太字テキスト\n");
      printer.addTextStyle(false, true, false, printer.COLOR_1);
      printer.addText("下線テキスト\n");
      printer.addTextStyle(true, false, false, printer.COLOR_1);
      printer.addText("反転テキスト\n");
      printer.addTextStyle(false, false, false, printer.COLOR_1);

      printer.addText("\n");
      printer.addCut(printer.CUT_FEED);
      printer.send();

      addTestResult("フォーマット", true, "フォーマットテストを実行しました");
    } catch (error) {
      addTestResult("フォーマット", false, `フォーマットエラー: ${error}`);
    }
  };

  // カスタムテキスト印刷
  const testCustomText = () => {
    if (!printer) {
      addTestResult("カスタム印刷", false, "プリンターが接続されていません");
      return;
    }

    if (!customText.trim()) {
      addTestResult(
        "カスタム印刷",
        false,
        "印刷するテキストを入力してください"
      );
      return;
    }

    try {
      printer.addTextLang("ja");
      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText("【 カスタムテキスト 】\n");
      printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

      printer.addTextAlign(printer.ALIGN_LEFT);
      printer.addText(customText + "\n\n");

      printer.addTextAlign(printer.ALIGN_CENTER);
      printer.addText(`印刷日時: ${new Date().toLocaleString("ja-JP")}\n\n`);

      printer.addCut(printer.CUT_FEED);
      printer.send();

      addTestResult("カスタム印刷", true, "カスタムテキストを印刷しました");
    } catch (error) {
      addTestResult("カスタム印刷", false, `カスタム印刷エラー: ${error}`);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">プリンター接続テスト</h1>
        <Badge
          variant={printerStatus.ready ? "default" : "destructive"}
          className="text-sm"
        >
          {printerStatus.ready ? "接続中" : "未接続"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 接続設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              プリンター設定
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
                <Label htmlFor="printer-ip">IPアドレス</Label>
                <Input
                  id="printer-ip"
                  value={printerIP}
                  onChange={(e) => setPrinterIP(e.target.value)}
                  placeholder="192.168.11.3"
                  disabled={printerStatus.connected}
                />
              </div>
              <div>
                <Label htmlFor="printer-port">ポート番号</Label>
                <Input
                  id="printer-port"
                  type="number"
                  value={printerPort}
                  onChange={(e) =>
                    setPrinterPort(parseInt(e.target.value) || 8008)
                  }
                  placeholder="8008"
                  disabled={printerStatus.connected}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={connectPrinter}
                disabled={printerStatus.connected || connecting}
                className="flex-1"
              >
                <Power className="h-4 w-4 mr-2" />
                {connecting
                  ? "接続中..."
                  : printerStatus.connected
                  ? "接続済み"
                  : "接続"}
              </Button>
              {printerStatus.connected && (
                <Button
                  onClick={disconnectPrinter}
                  variant="outline"
                  className="flex-1"
                >
                  切断
                </Button>
              )}
            </div>

            {printerStatus.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{printerStatus.error}</AlertDescription>
              </Alert>
            )}

            {printerStatus.lastActivity && (
              <div className="text-xs text-gray-500">
                最終通信: {printerStatus.lastActivity.toLocaleString("ja-JP")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 印刷テスト */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              印刷テスト
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={testBasicPrint}
              disabled={!printerStatus.ready}
              className="w-full"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              基本印刷テスト
            </Button>

            <Button
              onClick={testTextEncoding}
              disabled={!printerStatus.ready}
              className="w-full"
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              文字エンコーディングテスト
            </Button>

            <Button
              onClick={testFormatting}
              disabled={!printerStatus.ready}
              className="w-full"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              フォーマットテスト
            </Button>

            <div className="space-y-2">
              <Label htmlFor="custom-text">カスタムテキスト</Label>
              <Textarea
                id="custom-text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="印刷したいテキストを入力..."
                rows={3}
              />
              <Button
                onClick={testCustomText}
                disabled={!printerStatus.ready}
                className="w-full"
                variant="outline"
              >
                カスタムテキスト印刷
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* テスト結果履歴 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            テスト結果履歴
            <Badge variant="outline">{testResults.length}件</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              テスト結果はここに表示されます
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.testType}</div>
                      <div className="text-sm text-gray-600">
                        {result.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString("ja-JP")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
