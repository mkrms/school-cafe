// src/hooks/usePrinter.ts - プリンター機能のカスタムフック
import { useState, useCallback } from "react";

interface PrinterHookReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  printer: any;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: (ip: string, port: number) => Promise<void>;
  disconnect: () => void;
}

export function usePrinter(): PrinterHookReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [printer, setPrinter] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (ip: string, port: number) => {
    setConnecting(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const device = new (window as any).epson.ePOSDevice();

      device.connect(ip, port, (data: string) => {
        if (data === "OK" || data === "SSL_CONNECT_OK") {
          device.createDevice(
            "local_printer",
            device.DEVICE_TYPE_PRINTER,
            { crypto: false, buffer: false },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (devobj: any, retcode: string) => {
              if (retcode === "OK") {
                devobj.timeout = 60000;
                setPrinter(devobj);
                setConnected(true);
                setConnecting(false);
              } else {
                setError(`デバイス作成失敗: ${retcode}`);
                setConnecting(false);
              }
            }
          );
        } else {
          setError(`接続失敗: ${data}`);
          setConnecting(false);
        }
      });
    } catch (err) {
      setError(`接続エラー: ${err}`);
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (printer) {
      // プリンターの切断処理
      setPrinter(null);
      setConnected(false);
    }
  }, [printer]);

  return {
    printer,
    connected,
    connecting,
    error,
    connect,
    disconnect,
  };
}
