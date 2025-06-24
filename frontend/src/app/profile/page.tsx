// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfileForm } from "@/components/auth/profile-form";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOutAction } from "../actions";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 現在のユーザーIDを取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          setUserId(user.id);
        } else {
          toast.error("ログインが必要です");
        }
      } catch (error) {
        console.error("認証エラー:", error);
        toast.error("ユーザー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveProfile = async (updatedProfile: any) => {
    if (!userId) return;

    try {
      setSavingProfile(true);

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: updatedProfile.fullName,
        }),
      });

      if (!response.ok) {
        throw new Error("プロフィールの更新に失敗しました");
      }

      toast.success("プロフィールが更新されました");
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      toast.error("プロフィールの更新に失敗しました");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="プロフィール" showBackButton />

      <main className="flex-1 container max-w-md mx-auto py-6 px-4">
        {loading ? (
          <div className="text-center py-12">ユーザー情報を読み込み中...</div>
        ) : userId ? (
          <ProfileForm
            userId={userId}
            onSave={handleSaveProfile}
            isLoading={savingProfile}
          />
        ) : (
          <div className="text-center py-12">ログインが必要です</div>
        )}
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-destructive hover:text-destructive"
            onClick={signOutAction}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
