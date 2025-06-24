// src/types/strapi.ts

// Strapi 5のレスポンス型
export interface StrapiResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

// 単一レスポンス用
export interface StrapiSingleResponse<T> {
  data: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: Record<string, any>;
}

// メタデータ型
export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// メニューカテゴリーの型
export interface MenuCategory {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  menu_items?: MenuItem[];
}

// メニュー項目の型
export interface MenuItem {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  soldOut: boolean;
  stockQuantity?: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  image?: {
    id: number;
    name: string;
    alternativeText?: string | null;
    caption?: string | null;
    width: number;
    height: number;
    formats?: {
      thumbnail?: ImageFormat;
      small?: ImageFormat;
      medium?: ImageFormat;
      large?: ImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider_metadata: any | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  menu_category?: MenuCategory; // 修正: category → menu_category
}

// 画像フォーマット型
interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes?: number;
  url: string;
}

// 営業時間の型
export interface BusinessHour {
  id: number;
  documentId: string;
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// 特別営業日の型
export interface SpecialBusinessDay {
  id: number;
  documentId: string;
  specialDate: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
