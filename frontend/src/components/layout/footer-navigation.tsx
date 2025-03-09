// src/components/layout/footer-navigation.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, User, Clock } from "lucide-react"

export function FooterNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10">
      <div className="grid grid-cols-4 h-16">
        <Link href="/" className={`flex flex-col items-center justify-center ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">ホーム</span>
        </Link>

        <Link href="/orders" className={`flex flex-col items-center justify-center ${isActive("/orders") ? "text-primary" : "text-muted-foreground"}`}>
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">注文履歴</span>
        </Link>

        <Link href="/checkout" className={`flex flex-col items-center justify-center ${isActive("/checkout") ? "text-primary" : "text-muted-foreground"}`}>
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs mt-1">カート</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center justify-center ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">アカウント</span>
        </Link>
      </div>
    </div>
  )
}