//src/app/page.tsx (メニュー一覧ページ)
"use client"

import { useState, useEffect } from "react"
import { CategoryFilter } from "@/components/menu/category-filter"
import { MenuCard } from "@/components/menu/menu-card"
import { BusinessHours } from "@/components/menu/business-hours"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getMenuCategories, getMenuItems, getMenuItemsByCategory, getStrapiMedia } from "@/lib/strapi"
import { MenuCategory, MenuItem } from "@/types/strapi"
import { Skeleton } from "@/components/ui/skeleton"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"

export default function HomePage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  // カテゴリーとメニュー項目を取得する
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // カテゴリーを取得
        const categoriesResponse = await getMenuCategories()
        setCategories(categoriesResponse.data)

        // 初期表示では、すべてのメニュー項目を取得
        await fetchAllMenuItems()

      } catch (err) {
        console.error("Error fetching data:", err)
        setError("データの取得中にエラーが発生しました。")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // すべてのメニュー項目を取得する関数
  const fetchAllMenuItems = async () => {
    try {
      // メニュー項目を取得（カテゴリー情報も含む）
      const menuItemsResponse = await getMenuItems()
      setMenuItems(menuItemsResponse.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching all menu items:", err)
      setError("メニューデータの取得中にエラーが発生しました。")
      setLoading(false)
    }
  }

  // カテゴリーが選択された時の処理
  useEffect(() => {
    if (selectedCategory === null) {
      // すべてのメニューを表示
      fetchAllMenuItems()
    } else {
      // 選択されたカテゴリーのメニューを表示
      const fetchCategoryItems = async () => {
        try {
          setLoading(true)
          const menuItemsResponse = await getMenuItemsByCategory(selectedCategory)
          setMenuItems(menuItemsResponse.data)
          setLoading(false)
        } catch (err) {
          console.error(`Error fetching menu items for category ${selectedCategory}:`, err)
          setError("カテゴリーメニューの取得中にエラーが発生しました。")
          setLoading(false)
        }
      }

      fetchCategoryItems()
    }
  }, [selectedCategory])

  // 画像URLを取得する関数
  const getImageUrl = (item: MenuItem): string => {
    if (item.image?.formats?.medium?.url) {
      return getStrapiMedia(item.image.formats.medium.url) || '/images/menu-placeholder.jpg';
    } else if (item.image?.url) {
      return getStrapiMedia(item.image.url) || '/images/menu-placeholder.jpg';
    } else {
      return '/images/menu-placeholder.jpg';
    }
  }

  // カテゴリー名を取得する関数
  const getCategoryName = (item: MenuItem): string | null => {
    return item.menu_category?.name || null;
  }

  // カートに商品を追加する処理
  const handleAddToCart = (item: MenuItem) => {
    if (item.soldOut) {
      toast.error("申し訳ありません、この商品は売り切れです");
      return;
    }

    addItem({
      id: item.id.toString(),
      documentId: item.documentId,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: getImageUrl(item),
    });

    toast.success(`${item.name}をカートに追加しました`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-grow pb-4">
        {/* 営業時間 */}
        <div className="px-4 pt-4">
          <BusinessHours />
        </div>

        {/* カテゴリーフィルター */}
        {loading && !categories.length ? (
          <div className="px-4 pt-4">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        ) : (
          <CategoryFilter
            categories={categories}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* メニュー一覧 */}
        {error ? (
          <div className="p-4 text-center text-destructive">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-primary underline"
            >
              再読み込み
            </button>
          </div>
        ) : loading ? (
          <div className="px-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {menuItems.length > 0 ? (
              menuItems.map(item => (
                <MenuCard
                  key={item.id}
                  id={item.id.toString()}
                  documentId={item.documentId}
                  name={item.name}
                  price={item.price}
                  description={item.description || ""}
                  imageUrl={getImageUrl(item)}
                  categoryName={getCategoryName(item)}
                  onAddToCart={() => handleAddToCart(item)}
                  soldOut={item.soldOut}
                />
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-muted-foreground">
                該当するメニューがありません
              </div>
            )}
          </div>
        )}
      </main>

      {/* フッター */}
      <Footer />
    </div>
  )
}