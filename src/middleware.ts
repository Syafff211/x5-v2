import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // In demo mode the client-side AuthGuard handles protection.
  if (!isSupabaseConfigured) return NextResponse.next()

  const { response, user, role } = await updateSession(request)

  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')

  if ((isDashboard || isAdmin) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? '/auth/admin' : '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdmin && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = role === 'student' ? '/dashboard' : '/auth/admin'
    return NextResponse.redirect(url)
  }

  if (isDashboard && role === 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|og-image.svg|robots.txt|sitemap.xml).*)'],
}
