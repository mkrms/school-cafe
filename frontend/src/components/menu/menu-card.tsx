"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

type MenuCardProps = {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  onAddToCart: (id: string) => void
}

export function MenuCard({ id, name, price, description, imageUrl, onAddToCart }: MenuCardProps) {
  return (
    <Card className="py-0 overflow-hidden h-full flex flex-col">
      <Link href={`/menu/${id}`} className="flex-grow">
        <div className="relative h-40 w-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
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
        >
          <PlusCircle className="mr-1 h-3 w-3" />
          カートに追加
        </Button>
      </CardFooter>
    </Card>
  )
}