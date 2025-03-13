"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Session, User } from "@supabase/supabase-js"
import { createClientSupabaseClient, signOut as supabaseSignOut } from "@/lib/supabase"

// 認証コンテキストの型定義
type AuthContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

// 初期値
const initialAuthContext: AuthContextType = {
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {}
}

// コンテキストの作成
const AuthContext = createContext<AuthContextType>(initialAuthContext)

// 認証プロバイダーのプロップス型
type AuthProviderProps = {
  children: ReactNode
  initialSession: Session | null
}

// 認証プロバイダーコンポーネント
export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(initialSession)
  const [user, setUser] = useState<User | null>(initialSession?.user || null)
  const [isLoading, setIsLoading] = useState(!initialSession)

  // セッションと認証状態の監視
  useEffect(() => {
    // 初期セッションがある場合は早期リターン
    if (initialSession) {
      setIsLoading(false)
      return
    }

    const supabase = createClientSupabaseClient()
    
    // 初期セッションの取得
    const getInitialSession = async () => {
      try {
        setIsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Auth状態が変わるとき、クライアント側のルーティングをリフレッシュする
      if (typeof window !== "undefined") {
        router.refresh()
      }
    })

    // クリーンアップ
    return () => {
      subscription.unsubscribe()
    }
  }, [initialSession, router])

  // サインアウト処理
  const handleSignOut = async () => {
    try {
      await supabaseSignOut()
      setSession(null)
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // コンテキスト値
  const value = {
    session,
    user,
    isLoading,
    signOut: handleSignOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 認証コンテキストを使用するためのフック
export function useAuth() {
  return useContext(AuthContext)
}