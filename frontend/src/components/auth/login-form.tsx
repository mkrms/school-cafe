// src/components/auth/login-form.tsx
"use client";

import { useEffect, useState } from "react";
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
import { signInAction } from "@/app/actions";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMessage(error);
    }
  }, [searchParams]);

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>
            アカウント情報を入力してログインしてください
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  パスワードを忘れた場合
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full mt-3"
              formAction={signInAction}
            >
              ログイン
            </Button>
            <div className="text-center text-sm">
              アカウントをお持ちでない場合は{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                新規登録
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div>
        {errorMessage && (
          <div className="px-6 pt-2 text-red-700">{errorMessage}</div>
        )}
      </div>
    </>
  );
}
