import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          )
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — this is required to keep cookies in sync
  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  // Protected route: must be logged in
  if (path.startsWith('/espace-client')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // /admin is NOT protected here — role check is done client-side
  // in /admin/page.tsx because middleware cookie propagation is unreliable

  // Redirect logged-in users away from login/register
  if ((path === '/login' || path === '/register') && session) {
    return NextResponse.redirect(new URL('/espace-client', req.url))
  }

  return res
}

export const config = {
  matcher: ['/espace-client/:path*', '/login', '/register'],
}
