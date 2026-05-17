import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Função helper para validar sessão Supabase no middleware
 * Usa Server-Side Rendering (SSR) do Supabase
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifica se o usuário está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteções específicas por rota
  const pathname = request.nextUrl.pathname

  // Admin: block non-admins
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/entrar', request.url))
    }

    // Role checks happen in server routes and app auth context.
    // Avoid querying profiles in middleware to prevent false negatives
    // caused by RLS/policy behavior in edge runtime.
  }

  // Rotas de usuário logado: apenas autenticado pode acessar
  if (['/criar', '/perfil', '/salvos'].includes(pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL('/entrar', request.url))
    }
  }

  return supabaseResponse
}
