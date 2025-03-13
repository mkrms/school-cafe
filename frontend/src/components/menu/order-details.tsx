// src/components/menu/order-details.tsx
import React from "react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetailsProps {
  items: OrderItem[];
  total: number;
  notes?: string;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  items,
  total,
  notes
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">注文内容</h3>
      
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                商品
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                数量
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                金額
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  ¥{(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
            
            {/* 合計行 */}
            <tr className="bg-muted/20">
              <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-right">
                合計
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-right">
                ¥{total.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* 特記事項 */}
      {notes && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-1">特記事項</h4>
          <p className="text-sm border rounded-md p-3 bg-muted/20">{notes}</p>
        </div>
      )}
    </div>
  );
};