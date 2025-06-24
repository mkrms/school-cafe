// src/types/epson.d.ts

declare global {
  interface Window {
    epson: {
      ePOSDevice: new () => EPOSDevice
    }
  }
}

interface EPOSDevice {
  DEVICE_TYPE_PRINTER: string
  connect(address: string, port: number, callback: (result: string) => void): void
  createDevice(
    deviceId: string, 
    deviceType: string, 
    options: { crypto: boolean; buffer: boolean }, 
    callback: (device: EPOSPrinter | null, result: string) => void
  ): void
  disconnect(): void
}

interface EPOSPrinter {
  // プロパティ
  timeout: number
  
  // コールバック
  onreceive: ((result: PrintResult) => void) | null
  oncoveropen: (() => void) | null
  onpaperok: (() => void) | null
  onpaperend: (() => void) | null
  onpapernearend: (() => void) | null
  ondraweropen: (() => void) | null
  ondrawerclosed: (() => void) | null
  
  // 定数
  ALIGN_LEFT: string
  ALIGN_CENTER: string
  ALIGN_RIGHT: string
  
  FONT_A: string
  FONT_B: string
  FONT_C: string
  
  COLOR_1: string
  COLOR_2: string
  
  CUT_FEED: string
  CUT_NO_FEED: string
  
  // メソッド
  addText(text: string): EPOSPrinter
  addTextAlign(align: string): EPOSPrinter
  addTextSize(width: number, height: number): EPOSPrinter
  addTextStyle(reverse: boolean, underline: boolean, bold: boolean, color: string): EPOSPrinter
  addTextFont(font: string): EPOSPrinter
  
  addFeedLine(lines: number): EPOSPrinter
  addFeedUnit(units: number): EPOSPrinter
  
  addCut(type: string): EPOSPrinter
  
  addBarcode(data: string, type: string, hri?: string, font?: string, width?: number, height?: number): EPOSPrinter
  addSymbol(data: string, type: string, level?: string, width?: number, height?: number, size?: number): EPOSPrinter
  
  send(): void
  
  // 画像印刷
  addImage(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string,
    mode?: string
  ): EPOSPrinter
}

interface PrintResult {
  success: boolean
  code: string
  status: number
  battery?: number
  printjobid?: string
}

export {}