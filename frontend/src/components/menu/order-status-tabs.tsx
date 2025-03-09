"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type OrderStatusTabsProps = {
  activeStatus: string
  onStatusChange: (status: string) => void
}

export function OrderStatusTabs({ activeStatus, onStatusChange }: OrderStatusTabsProps) {
  return (
    <Tabs value={activeStatus} onValueChange={onStatusChange} className="w-full mb-4">
      <TabsList className="w-full grid grid-cols-5">
        <TabsTrigger value="all" className="text-xs sm:text-sm">
          すべて
        </TabsTrigger>
        <TabsTrigger value="pending" className="text-xs sm:text-sm">
          支払待ち
        </TabsTrigger>
        <TabsTrigger value="preparing" className="text-xs sm:text-sm">
          準備中
        </TabsTrigger>
        <TabsTrigger value="ready" className="text-xs sm:text-sm">
          受取待ち
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-xs sm:text-sm">
          完了
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}