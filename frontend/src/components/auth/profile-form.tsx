"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// ユーザープロフィールの型定義
type UserProfile = {
  fullName: string
  email: string
  studentId?: string
  phoneNumber?: string
}

type ProfileFormProps = {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
  isLoading?: boolean
}

export function ProfileForm({ profile, onSave, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<UserProfile>(profile)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)

    // 実際のアプリではAPIの結果を待って成功/失敗に応じてトーストを表示
    toast.success("プロフィールが変更されました")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール情報</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">氏名</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">学籍番号（任意）</Label>
            <Input
              id="studentId"
              name="studentId"
              value={formData.studentId || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">電話番号（任意）</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "保存中..." : "変更を保存"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}