// lib/strapi.ts
// Strapiとの通信を行うための共通関数

export async function fetchAPI(endpoint: string, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${endpoint}`, mergedOptions);
  
  if (!res.ok) {
    console.error('API error:', await res.text());
    throw new Error(`API error: ${res.status}`);
  }
  
  return await res.json();
}

// メニューカテゴリを取得する関数
export async function getCategories() {
  const data = await fetchAPI('categories?populate=image');
  return data.data;
}

// カテゴリ別のメニュー項目を取得する関数
export async function getMenuItemsByCategory(categoryId: string) {
  const data = await fetchAPI(`menu-items?filters[category][id][$eq]=${categoryId}&populate=image`);
  return data.data;
}

// 営業時間を取得する関数
export async function getBusinessHours() {
  const data = await fetchAPI('business-hours');
  return data.data;
}

// 注文履歴を取得する関数
export async function getOrderHistory(userId: string) {
  const data = await fetchAPI(`orders?filters[userId][$eq]=${userId}&sort=createdAt:desc`);
  return data.data;
}

// 注文を作成する関数
export async function createOrder(orderData: any) {
  const response = await fetchAPI('orders', {
    method: 'POST',
    body: JSON.stringify({
      data: orderData
    }),
  });
  return response.data;
}

// 注文ステータスを更新する関数
export async function updateOrderStatus(orderId: string, status: string) {
  const response = await fetchAPI(`orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        status
      }
    }),
  });
  return response.data;
}