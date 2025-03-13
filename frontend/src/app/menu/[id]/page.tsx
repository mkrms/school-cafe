// src/app/menu/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getMenuItem, getStrapiMedia } from "@/lib/strapi";
import { MenuItem } from "@/types/strapi";
import { useCart } from "@/context/cart-context";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface MenuDetailPageProps {
  params: {
    id: string;
  };
}

export default function MenuDetailPage({ params }: MenuDetailPageProps) {
  const id = params.id;
  const router = useRouter();
  const { addItem } = useCart();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // メニュー項目を取得
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        setLoading(true);
        const response = await getMenuItem(id);
        
        if (!response.data) {
          setError("メニュー項目が見つかりませんでした。");
          setLoading(false);
          return;
        }
        
        setMenuItem(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching menu item:", err);
        setError("メニュー項目の取得中にエラーが発生しました。");
        setLoading(false);
      }
    };
    
    fetchMenuItem();
  }, [id]);
  
  // 画像URLを取得する関数
  const getImageUrl = (): string => {
    if (!menuItem) return '/images/menu-placeholder.jpg';
    
    if (menuItem.image?.formats?.medium?.url) {
      return getStrapiMedia(menuItem.image.formats.medium.url) || '/images/menu-placeholder.jpg';
    } else if (menuItem.image?.url) {
      return getStrapiMedia(menuItem.image.url) || '/images/menu-placeholder.jpg';
    }
    
    return '/images/menu-placeholder.jpg';
  };
  
  // カートに追加する処理
  const handleAddToCart = () => {
    if (!menuItem) return;
    
    if (menuItem.soldOut) {
      toast.error("申し訳ありません、この商品は売り切れです");
      return;
    }
    
    addItem({
      id: menuItem.id.toString(),
      documentId: menuItem.documentId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantity,
      imageUrl: getImageUrl(),
    });
    
    toast.success(`${menuItem.name}をカートに追加しました`);
    router.push("/");
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        showBackButton={true} 
        title="メニュー詳細" 
        onBackClick={() => router.back()}
      />
      
      {loading ? (
        // ローディング表示
        <main className="flex-grow">
          <Skeleton className="h-64 w-full" />
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </main>
      ) : error ? (
        // エラー表示
        <main className="flex-grow p-4">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              戻る
            </Button>
          </div>
        </main>
      ) : menuItem ? (
        // メニュー詳細表示
        <main className="flex-grow">
          <div className="relative h-64 w-full">
            <Image
              src={getImageUrl()}
              alt={menuItem.name}
              fill
              className="object-cover"
            />
            {menuItem.soldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="bg-red-500 text-white px-6 py-2 rounded-full text-lg font-bold transform rotate-12">
                  売り切れ
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h1 className="text-2xl font-bold">{menuItem.name}</h1>
            <p className="text-xl font-bold mt-1 mb-3">¥{menuItem.price.toLocaleString()}</p>
            <p className="text-muted-foreground mb-6">{menuItem.description}</p>
            
            {/* カテゴリー表示 */}
            {menuItem.menu_category && (
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs">
                  {menuItem.menu_category.name}
                </span>
              </div>
            )}
            
            {/* 数量選択 */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium">数量</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || menuItem.soldOut}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={menuItem.soldOut}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* 合計金額と注文ボタン */}
            <div className="sticky bottom-4 bg-background pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">合計</span>
                <span className="text-xl font-bold">¥{(menuItem.price * quantity).toLocaleString()}</span>
              </div>
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 text-lg"
                disabled={menuItem.soldOut}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {menuItem.soldOut ? "売り切れ" : "カートに追加"}
              </Button>
            </div>
          </div>
        </main>
      ) : null}
      
      <Footer />
    </div>
  );
}