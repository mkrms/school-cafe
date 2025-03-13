"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// カート内のアイテムの型定義
export type CartItem = {
  id: string;
  documentId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

// カートコンテキストの型定義
type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

// コンテキストの初期値
const initialCartContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  setIsOpen: () => {},
};

// カートコンテキストの作成
const CartContext = createContext<CartContextType>(initialCartContext);

// カートプロバイダーの型定義
type CartProviderProps = {
  children: ReactNode;
};

// カートプロバイダーコンポーネント
export function CartProvider({ children }: CartProviderProps) {
  // ステート
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // マウント時の処理
  useEffect(() => {
    setMounted(true);
    // ローカルストレージからカート情報を取得
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // カートの変更を監視してローカルストレージに保存
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  // カートに商品を追加
  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // 既存の商品かどうかをチェック
      const existingItemIndex = prevItems.findIndex(
        (prevItem) => prevItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        // 既存の商品なら数量を増やす
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        return updatedItems;
      } else {
        // 新しい商品ならそのまま追加
        return [...prevItems, item];
      }
    });
  };

  // カートから商品を削除
  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // 数量を更新
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // カートをクリア
  const clearCart = () => {
    setItems([]);
  };

  // 合計個数を計算
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // 合計金額を計算
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // コンテキスト値
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isOpen,
    setIsOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// カートコンテキストを使用するためのフック
export function useCart() {
  return useContext(CartContext);
}