import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gakushoku GO - 学食モバイルオーダー",
  description: "高校・大学の学食をスマートフォンから簡単に注文できるモバイルオーダーアプリ",
};

// サーバーコンポーネントでセッションを取得
async function getInitialSession() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession = await getInitialSession();

  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider initialSession={initialSession}>
          <CartProvider>
            {children}
            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}