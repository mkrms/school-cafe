import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 認証が必要なパス
const protectedPaths = [
  '/checkout',
  '/orders',
  '/profile',
  '/update-password',
]

// 認証済みユーザーがアクセスすべきでないパス
const authRoutes = [
  '/login',
  '/register',
  '/reset-password',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabaseクライアントを作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  
  // セッションの取得
  const { data: { session } } = await supabase.auth.getSession()
  
  // 認証が必要なページで、未認証の場合はログインページにリダイレクト
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // 既に認証済みの場合、ログインページなどにアクセスしようとするとホームにリダイレクト
  const isAuthRoute = authRoutes.some(path => pathname.startsWith(path))
  if (isAuthRoute && session) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return response
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/reset-password',
    '/update-password',
  ],
}