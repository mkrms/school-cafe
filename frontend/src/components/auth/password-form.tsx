"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type PasswordFormProps = {
  onSave: (currentPassword: string, newPassword: string) => void
  isLoading?: boolean
}

export function PasswordForm({ onSave, isLoading = false }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // パスワード一致チェック
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードと確認用パスワードが一致しません")
      toast.error("新しいパスワードと確認用パスワードが一致しません")
      return
    }

    // パスワード強度チェック
    if (newPassword.length < 8) {
      setError("パスワードは8文字以上である必要があります")
      toast.error("パスワードは8文字以上である必要があります")
      return
    }

    onSave(currentPassword, newPassword)

    // 実際のアプリではAPIの結果を待って成功/失敗に応じてトーストを表示
    toast.success("パスワードが変更されました")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>パスワード変更</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">現在のパスワード</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "変更中..." : "パスワードを変更"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}