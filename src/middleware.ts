import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Protect /espace-client — requires authentication
  if (!user && path.startsWith('/espace-client')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect /admin — requires authentication + admin role (checked server-side)
  if (path.startsWith('/admin')) {
    // Allow access to admin login page without auth
    if (path === '/admin/login') {
      return response
    }

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/espace-client', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/espace-client/:path*', '/admin/:path*'],
}
