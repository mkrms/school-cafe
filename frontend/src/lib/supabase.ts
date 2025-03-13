// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// クライアント側で使用するSupabaseクライアント
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 以下は認証関連のヘルパー関数
// クライアントコンポーネントで呼び出す時に毎回新しいクライアントを作成

// セッションを取得
export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// カレントユーザーを取得
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// サインアップ（新規登録）
export async function signUp(email: string, password: string, userData: { full_name: string }) {
  const supabase = createClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })
}

// サインイン（ログイン）
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// サインアウト（ログアウト）
export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

// パスワードリセットメール送信
export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient()
  return await supabase.auth.resetPasswordForEmail(email)
}

// パスワード更新
export async function updatePassword(password: string) {
  const supabase = createClient()
  return await supabase.auth.updateUser({
    password,
  })
}