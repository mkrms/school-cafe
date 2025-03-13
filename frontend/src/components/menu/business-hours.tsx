"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBusinessHours, getSpecialBusinessDays } from "@/lib/strapi";
import { BusinessHour, SpecialBusinessDay } from "@/types/strapi";

export function BusinessHours() {
  const [regularHours, setRegularHours] = useState<BusinessHour[]>([]);
  const [specialDays, setSpecialDays] = useState<SpecialBusinessDay[]>([]);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [openTime, setOpenTime] = useState<string | null>(null);
  const [closeTime, setCloseTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        setLoading(true);
        
        // 通常の営業時間を取得
        const hoursResponse = await getBusinessHours();
        setRegularHours(hoursResponse.data);
        
        // 特別営業日を取得
        const specialDaysResponse = await getSpecialBusinessDays();
        setSpecialDays(specialDaysResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching business hours:", err);
        setError("営業時間の取得中にエラーが発生しました。");
        setLoading(false);
      }
    };
    
    fetchBusinessHours();
  }, []);

  // 現在の営業状態を計算
  useEffect(() => {
    if (loading || error) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD形式
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    // 特別営業日かどうかをチェック
    const specialDay = specialDays.find(day => day.specialDate === today);
    
    if (specialDay) {
      // 特別営業日の場合
      if (specialDay.isClosed) {
        // 休業日
        setIsOpen(false);
        setOpenTime(null);
        setCloseTime(null);
        return;
      }
      
      if (specialDay.openTime && specialDay.closeTime) {
        // 特別営業時間を設定
        setOpenTime(formatTime(specialDay.openTime));
        setCloseTime(formatTime(specialDay.closeTime));
        
        // 現在時刻が営業時間内かチェック
        const openTimeParts = specialDay.openTime.split(':');
        const closeTimeParts = specialDay.closeTime.split(':');
        const openTimeMinutes = parseInt(openTimeParts[0]) * 60 + parseInt(openTimeParts[1]);
        const closeTimeMinutes = parseInt(closeTimeParts[0]) * 60 + parseInt(closeTimeParts[1]);
        
        setIsOpen(currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes);
        return;
      }
    }
    
    // 通常営業日の場合
    const todayHours = regularHours.find(hour => hour.dayOfWeek === dayOfWeek);
    
    if (todayHours) {
      if (todayHours.isClosed) {
        // 定休日
        setIsOpen(false);
        setOpenTime(null);
        setCloseTime(null);
        return;
      }
      
      // 通常営業時間を設定
      setOpenTime(formatTime(todayHours.openTime));
      setCloseTime(formatTime(todayHours.closeTime));
      
      // 現在時刻が営業時間内かチェック
      const openTimeParts = todayHours.openTime.split(':');
      const closeTimeParts = todayHours.closeTime.split(':');
      const openTimeMinutes = parseInt(openTimeParts[0]) * 60 + parseInt(openTimeParts[1]);
      const closeTimeMinutes = parseInt(closeTimeParts[0]) * 60 + parseInt(closeTimeParts[1]);
      
      setIsOpen(currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes);
    } else {
      // 該当する営業時間情報がない場合
      setIsOpen(false);
      setOpenTime(null);
      setCloseTime(null);
    }
  }, [regularHours, specialDays, loading, error]);

  // 時間を見やすいフォーマットに変換する関数
  const formatTime = (timeString: string): string => {
    // "HH:MM:SS" から "HH:MM" の形式に変換
    return timeString.substring(0, 5);
  };

  // 閉店1時間前かどうかをチェック
  const isNearClosing = (): boolean => {
    if (!isOpen || !closeTime) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const closeTimeParts = closeTime.split(':');
    const closeTimeMinutes = parseInt(closeTimeParts[0]) * 60 + parseInt(closeTimeParts[1]);
    
    // 閉店1時間前（60分前）かどうか
    return closeTimeMinutes - currentTimeMinutes <= 60 && closeTimeMinutes - currentTimeMinutes > 0;
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-3">
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardContent className="p-3 text-destructive text-sm">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-3 flex items-center">
        <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
        <div className="flex-grow">
          {openTime && closeTime ? (
            <p className="text-sm">
              営業時間: {openTime} - {closeTime}
            </p>
          ) : (
            <p className="text-sm">本日は休業日です</p>
          )}
          {isOpen && isNearClosing() && (
            <p className="text-xs text-amber-500 font-medium">
              間もなく閉店します
            </p>
          )}
        </div>
        <div className="ml-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isOpen ? "営業中" : "営業時間外"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}