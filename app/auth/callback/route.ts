import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  let next = request.nextUrl.searchParams.get('next') ?? '/'
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    next = '/'
  }
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL(next, request.url))
  }

  const redirectUrl = new URL(next, request.url)
  const response = NextResponse.redirect(redirectUrl)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const errorUrl = new URL('/auth/auth-code-error', request.url)
    errorUrl.searchParams.set('message', error.message)
    return NextResponse.redirect(errorUrl)
  }

  return response
}