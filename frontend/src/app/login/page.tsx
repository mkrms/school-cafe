// src/app/login/page.tsx
import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Gakushoku GO Logo"
            width={64}
            height={64}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold">Gakushoku GO</h1>
          <p className="text-muted-foreground">学食モバイルオーダーシステム</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}