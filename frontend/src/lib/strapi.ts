// src/lib/strapi.ts
import qs from "qs";
import { StrapiResponse, StrapiSingleResponse } from "@/types/strapi";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1338";
const API_TOKEN = process.env.STRAPI_API_TOKEN || "";

/**
 * 基本的なStrapiのfetch関数
 */
export async function fetchAPI<T>(
  path: string,
  urlParamsObject = {},
  options = {}
): Promise<T> {
  try {
    // クエリパラメータの構築
    const queryString = qs.stringify(urlParamsObject, {
      encodeValuesOnly: true, // リレーションフィルタを正しく動作させるため
    });

    // URLの構築
    const requestUrl = `${STRAPI_URL}/api${path}${
      queryString ? `?${queryString}` : ""
    }`;

    // デバッグ用
    console.log(`API Request: ${requestUrl}`);
    console.log("Params:", urlParamsObject);

    // fetch options
    const mergedOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      ...options,
    };

    // fetchの実行
    const response = await fetch(requestUrl, mergedOptions);

    // レスポンスの確認
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    // JSONデータの取得
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching API:", error);
    throw error;
  }
}

/**
 * メニューカテゴリーの取得
 */
export function getMenuCategories(params = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fetchAPI<StrapiResponse<any>>("/menu-categories", {
    populate: "menu_items", // メニュー項目を取得
    sort: ["displayOrder:asc"],
    filters: {
      isActive: {
        $eq: true,
      },
    },
    ...params,
  });
}

/**
 * メニュー項目の取得
 */
export function getMenuItems(params = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fetchAPI<StrapiResponse<any>>("/menu-items", {
    populate: ["image", "menu_category"], // 修正: category → menu_category
    sort: ["name:asc"],
    filters: {
      isActive: {
        $eq: true,
      },
    },
    ...params,
  });
}

/**
 * 特定のカテゴリーに属するメニュー項目の取得
 */
export function getMenuItemsByCategory(categoryId: number, params = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fetchAPI<StrapiResponse<any>>("/menu-items", {
    populate: ["image", "menu_category"], // 修正: category → menu_category
    sort: ["name:asc"],
    filters: {
      isActive: {
        $eq: true,
      },
      menu_category: {
        // 修正: category → menu_category
        id: {
          $eq: categoryId,
        },
      },
    },
    ...params,
  });
}

/**
 * 特定のメニュー項目を取得
 */
export function getMenuItem(documentId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fetchAPI<StrapiSingleResponse<any>>(`/menu-items/${documentId}`, {
    populate: ["image", "menu_category"], // 修正: category → menu_category
  });
}

/**
 * 画像URLを構築する
 */
export function getStrapiMedia(url: string | null) {
  if (!url) return null;

  // URLが絶対URLの場合はそのまま返す
  if (url.startsWith("http") || url.startsWith("//")) return url;

  // 相対URLの場合はStrapi URLを付与
  return `${STRAPI_URL}${url}`;
}

/**
 * 営業時間の取得
 */
export function getBusinessHours() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fetchAPI<StrapiResponse<any>>("/business-hours", {
    sort: ["dayOfWeek:asc"],
  });
}

/**
 * 特別営業日の取得
 */
export function getSpecialBusinessDays(params = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fetchAPI<StrapiResponse<any>>("/special-business-days", {
    filters: {
      specialDate: {
        $gte: today.toISOString().split("T")[0],
      },
    },
    sort: ["specialDate:asc"],
    ...params,
  });
}
