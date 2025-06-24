// src/components/auth/register-form.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUpAction } from "@/app/actions";

export function RegisterForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">アカウント作成</CardTitle>
        <CardDescription>
          以下の情報を入力して新規登録を行ってください
        </CardDescription>
      </CardHeader>
      <form>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">氏名</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="山田 太郎"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full mt-3"
            formAction={signUpAction}
          >
            登録する
          </Button>
          <div className="text-center text-sm">
            すでにアカウントをお持ちの場合は{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              ログイン
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
