import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser();

    // 認証が必要なルート
    const authRequiredPaths = [
      '/',  // ルートパスを追加
      '/checkout',
      '/orders',
      '/menu',
      '/payment',
      '/profile'
    ];

    // 認証済みユーザー向けリダイレクトパス
    const authRedirectPaths = [
      '/sign-in',
      '/sign-up'
    ];

    // 認証なしでもアクセス可能なパス
    const publicPaths = [
      '/about',
      '/help',
      '/faq'
      // 他の公開ページも追加できます
    ];

    // 認証が必要なルートで認証されていない場合
    const isProtectedRoute = authRequiredPaths.some(path =>
      request.nextUrl.pathname === path ||
      (path !== '/' && request.nextUrl.pathname.startsWith(path))
    );

    // ルートパスの特別な処理
    const isPublicPath = publicPaths.some(path =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedRoute && error && !isPublicPath) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // 認証済みユーザーが認証ページにアクセスした場合
    if (user && authRedirectPaths.some(path => request.nextUrl.pathname === path)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (e) {
    console.error("Supabase client error:", e);
    // Supabaseクライアントが作成できない場合
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

export default updateSession;

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: [
    /*
     * これらのルートに対してミドルウェアを適用:
     * - 認証が必要なルート
     * - 認証ページ
     * - 静的ファイルやAPIは除外
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};