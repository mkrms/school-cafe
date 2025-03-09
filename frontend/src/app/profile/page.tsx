"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProfileForm } from "@/components/auth/profile-form"
import { PasswordForm } from "@/components/auth/password-form"
import { Toaster } from "@/components/ui/sonner"
import { LogOut } from "lucide-react"

// 仮のユーザー情報
const sampleUser = {
  fullName: "山田 太郎",
  email: "yamada@example.com",
  studentId: "S12345",
  phoneNumber: "090-1234-5678"
}

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)

  // プロフィール更新処理
  const handleProfileSave = (profile: any) => {
    setIsLoading(true)

    // 実際のアプリではここでAPIを呼び出してプロフィールを更新します
    setTimeout(() => {
      setIsLoading(false)
      // toast.success("プロフィールが更新されました") - コンポーネント内で実行
    }, 1000)
  }

  // パスワード変更処理
  const handlePasswordSave = (currentPassword: string, newPassword: string) => {
    setIsLoading(true)

    // 実際のアプリではここでAPIを呼び出してパスワードを変更します
    setTimeout(() => {
      setIsLoading(false)
      // toast.success("パスワードが変更されました") - コンポーネント内で実行
    }, 1000)
  }

  // ログアウト処理
  const handleLogout = () => {
    // 実際のアプリではここでログアウト処理を行います
    toast.success("ログアウトしました")
    setTimeout(() => {
      router.push("/login")
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="アカウント"
        showBackButton={true}
        onBackClick={() => router.push("/")}
      />

      <main className="flex-grow p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="password">パスワード</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileForm
              profile={sampleUser}
              onSave={handleProfileSave}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <PasswordForm
              onSave={handlePasswordSave}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  )
}