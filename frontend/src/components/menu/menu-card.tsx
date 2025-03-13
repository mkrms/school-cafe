// src/components/menu/menu-card.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface MenuCardProps {
  id: string
  documentId: string
  name: string
  price: number
  description: string
  imageUrl: string
  categoryName: string | null
  onAddToCart: () => void
  soldOut?: boolean
}

export function MenuCard({
  id,
  documentId,
  name,
  price,
  description,
  imageUrl,
  categoryName,
  onAddToCart,
  soldOut = false,
}: MenuCardProps) {
  // 商品詳細ページへのリンク
  const detailLink = `/menu/${documentId}`
  
  // 説明文を短くする
  const truncatedDescription = description.length > 60
    ? `${description.substring(0, 60)}...`
    : description
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Link href={detailLink} className="relative">
        <div className="relative h-40 bg-muted">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold transform rotate-12">
                売り切れ
              </span>
            </div>
          )}
          
          {categoryName && (
            <span className="absolute top-2 left-2 bg-background/90 px-2 py-0.5 rounded text-xs">
              {categoryName}
            </span>
          )}
        </div>
      </Link>
      
      <CardContent className="flex-grow p-3">
        <Link href={detailLink}>
          <h3 className="font-medium line-clamp-2 hover:underline">{name}</h3>
        </Link>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {truncatedDescription}
          </p>
        )}
        <p className="font-bold mt-2">¥{price.toLocaleString()}</p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <Button
          size="sm"
          className="w-full"
          onClick={onAddToCart}
          disabled={soldOut}
          variant={soldOut ? "outline" : "default"}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {soldOut ? "売り切れ" : "カートに追加"}
        </Button>
      </CardFooter>
    </Card>
  )
}