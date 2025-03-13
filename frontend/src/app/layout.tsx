import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/cart-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gakushoku GO - 学食モバイルオーダー",
  description: "高校・大学の学食をスマートフォンから簡単に注文できるモバイルオーダーアプリ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="ja">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <Toaster position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}