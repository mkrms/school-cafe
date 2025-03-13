// src/components/auth/profile-form.tsx
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// ユーザープロフィールの型定義
type UserProfile = {
  fullName: string
  email: string
}

type ProfileFormProps = {
  userId: string
  onSave: (profile: UserProfile) => void
  isLoading?: boolean
}

export function ProfileForm({ userId, onSave, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<UserProfile>({
    fullName: "",
    email: ""
  })
  const [fetchLoading, setFetchLoading] = useState(true)

  // ユーザーデータを取得
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setFetchLoading(true)
        const response = await fetch(`/api/users/${userId}`)

        if (!response.ok) {
          throw new Error("ユーザー情報の取得に失敗しました")
        }

        const userData = await response.json()

        setFormData({
          fullName: userData.full_name || "",
          email: userData.email || "",
        })
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast.error("プロフィールの読み込みに失敗しました")
      } finally {
        setFetchLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

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
  }

  if (fetchLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
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
              disabled  // メールアドレスは変更不可
            />
          </div>

        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full mt-3" disabled={isLoading}>
            {isLoading ? "保存中..." : "変更を保存"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}