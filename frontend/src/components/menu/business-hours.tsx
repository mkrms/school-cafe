import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function BusinessHours() {
  // 実際の実装では、これらの値はAPIから取得します
  const isOpen = true
  const openTime = "11:00"
  const closeTime = "14:00"
  const currentHour = new Date().getHours()
  const isNearClosing = currentHour >= 13 && currentHour < 14 // 閉店1時間前

  return (
    <Card className="mb-4">
      <CardContent className="p-3 flex items-center">
        <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
        <div className="flex-grow">
          <p className="text-sm">
            営業時間: {openTime} - {closeTime}
          </p>
          {isNearClosing ? (
            <p className="text-xs text-amber-500 font-medium">
              間もなく閉店します
            </p>
          ) : null}
        </div>
        <div className="ml-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {isOpen ? "営業中" : "営業時間外"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}