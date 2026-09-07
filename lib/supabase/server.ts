import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Cria um cliente Supabase com a Service Role Key (USAR APENAS NO SERVIDOR)
 * A chave deve estar definida em `SUPABASE_SERVICE_ROLE_KEY` no ambiente.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE service role environment variables')
  }

  return createClient(url, key)
}

/**
 * Cria um cliente Supabase autenticado para Route Handlers lendo cookies da requisição.
 */
export function createRouteHandlerClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll() {
        /* noop */
      },
    },
  })
}

/**
 * Validador padrão de sessão de administrador para Route Handlers
 */
export async function requireAdminSession(request: NextRequest) {
  const supabase = createRouteHandlerClient(request)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      service: null,
      errorResponse: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    }
  }

  const service = createServiceRoleClient()
  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('id, email, name, role, banned')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return {
      user: null,
      profile: null,
      service: null,
      errorResponse: NextResponse.json({ error: 'Profile not found' }, { status: 404 }),
    }
  }

  if (profile.banned) {
    return {
      user: null,
      profile: null,
      service: null,
      errorResponse: NextResponse.json({ error: 'Conta suspensa pela moderação' }, { status: 403 }),
    }
  }

  if (profile.role !== 'ADMIN') {
    return {
      user: null,
      profile: null,
      service: null,
      errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return {
    user,
    profile,
    service,
    errorResponse: null,
  }
}

