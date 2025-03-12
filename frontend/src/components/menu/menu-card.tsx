"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

type MenuCardProps = {
  id: string
  documentId: string
  name: string
  price: number
  description: string
  imageUrl: string
  categoryName?: string | null
  soldOut?: boolean
  onAddToCart: (id: string) => void
}

export function MenuCard({ 
  id, 
  documentId, 
  name, 
  price, 
  description, 
  imageUrl,
  categoryName,
  soldOut = false,
  onAddToCart 
}: MenuCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Link href={`/menu/${documentId}`} className="flex-grow relative">
        <div className="relative h-40 w-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className={`object-cover ${soldOut ? 'opacity-60' : ''}`}
          />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12">
                売り切れ
              </span>
            </div>
          )}
          
          {/* カテゴリー名バッジ */}
          {categoryName && (
            <div className="absolute top-2 left-2">
              <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                {categoryName}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-base">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">{description}</p>
          <p className="mt-2 font-bold">¥{price.toLocaleString()}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-3 pt-0">
        <Button 
          onClick={() => onAddToCart(id)} 
          size="sm" 
          className="w-full text-xs h-8"
          disabled={soldOut}
        >
          <PlusCircle className="mr-1 h-3 w-3" />
          {soldOut ? "売り切れ" : "カートに追加"}
        </Button>
      </CardFooter>
    </Card>
  )
}