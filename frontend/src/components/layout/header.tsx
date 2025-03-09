"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartDrawer } from "@/components/cart/cart-drawer"

type HeaderProps = {
  showBackButton?: boolean
  title?: string
  onBackClick?: () => void
}

export function Header({
  showBackButton = false,
  title = "Gakushoku GO",
  onBackClick
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b p-3 flex items-center justify-between">
      <div className="flex items-center">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 h-9 w-9"
            onClick={onBackClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </Button>
        ) : (
          <Link href="/profile">
            <User className="h-6 w-6 mr-3" />
          </Link>
        )}
        <div className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Gakushoku GO Logo"
            width={28}
            height={28}
            className="mr-2"
          />
          <h1 className="font-bold text-lg">{title}</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Link href="/menu/search">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-5 w-5" />
          </Button>
        </Link>
        <CartDrawer />
      </div>
    </header>
  )
}