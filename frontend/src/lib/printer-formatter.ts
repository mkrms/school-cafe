import { OrderData } from "./qr-parser";

// src/lib/printer-formatter.ts - 印刷フォーマットユーティリティ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatOrderReceipt(printer: any, order: OrderData): void {
  // ヘッダー
  printer.addTextAlign(printer.ALIGN_CENTER);
  printer.addTextSize(2, 2);
  printer.addText("【 学食注文伝票 】\n");
  printer.addTextSize(1, 1);
  printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

  // 注文情報
  printer.addTextAlign(printer.ALIGN_LEFT);
  printer.addText(`注文ID: ${order.orderId}\n`);
  printer.addText(`お客様: ${order.customerName}\n`);
  printer.addText(
    `注文時刻: ${new Date(order.orderTime).toLocaleString("ja-JP")}\n`
  );
  printer.addText(
    `決済状況: ${order.paymentStatus === "paid" ? "決済済み" : "未決済"}\n\n`
  );

  // 注文内容
  printer.addTextStyle(false, false, true, printer.COLOR_1);
  printer.addText("【 注文内容 】\n");
  printer.addTextStyle(false, false, false, printer.COLOR_1);
  printer.addText("--------------------------------\n");

  order.items.forEach((item, index) => {
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
  printer.addText(`合計: ¥${order.totalAmount}\n`);
  printer.addTextSize(1, 1);

  // 特記事項
  if (order.specialInstructions) {
    printer.addText("\n【 特記事項 】\n");
    printer.addText(`${order.specialInstructions}\n`);
  }

  // フッター
  printer.addText("\n");
  printer.addTextAlign(printer.ALIGN_CENTER);
  printer.addText("調理完了後、お客様をお呼びください\n");
  printer.addText(`印刷時刻: ${new Date().toLocaleString("ja-JP")}\n\n`);

  printer.addCut(printer.CUT_FEED);
}

// QRコード付き伝票の印刷（管理用）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatManagementReceipt(printer: any, order: OrderData): void {
  printer.addTextAlign(printer.ALIGN_CENTER);
  printer.addText("【 管理用伝票 】\n");
  printer.addText("━━━━━━━━━━━━━━━━━━━━\n\n");

  // 基本情報
  printer.addTextAlign(printer.ALIGN_LEFT);
  printer.addText(`注文ID: ${order.orderId}\n`);
  printer.addText(`顧客ID: ${order.customerId}\n`);
  printer.addText(`印刷時刻: ${new Date().toLocaleString("ja-JP")}\n\n`);

  // QRコード印刷（注文IDをQRコード化）
  try {
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addSymbol(
      order.orderId,
      printer.SYMBOL_QRCODE_MODEL_2,
      printer.LEVEL_M,
      5,
      5,
      200
    );
    printer.addText("\n");
  } catch (error) {
    console.error("QRコード印刷エラー:", error);
    printer.addText(`QR: ${order.orderId}\n\n`);
  }

  printer.addCut(printer.CUT_FEED);
}
