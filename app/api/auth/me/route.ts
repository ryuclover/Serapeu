import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: NO_CACHE_HEADERS }
      )
    }

    const service = createServiceRoleClient()
    const { data: profile, error: profileError } = await service
      .from('profiles')
      .select('id, email, name, role, banned, created_at')
      .eq('id', user.id)
      .maybeSingle()

    let userProfile = profile

    // Auto-recuperação (Self-Healing / JIT Provisioning):
    // Se o perfil não existir ainda por atraso do trigger de cadastro, cria automaticamente.
    if (!userProfile) {
      const fallbackName =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        (user.email ? user.email.split('@')[0] : 'Usuário')

      const { data: newProfile, error: insertError } = await service
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          name: fallbackName,
          role: 'USER',
          banned: false,
        })
        .select('id, email, name, role, banned, created_at')
        .single()

      if (insertError || !newProfile) {
        return NextResponse.json(
          { error: profileError?.message || insertError?.message || 'Profile not found' },
          { status: 500, headers: NO_CACHE_HEADERS }
        )
      }

      userProfile = newProfile
    }

    if (userProfile.banned) {
      return NextResponse.json(
        { banned: true, error: 'Sua conta foi suspensa pela moderação.' },
        { status: 403, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: userProfile.name,
          role: userProfile.role,
          banned: false,
          createdAt: userProfile.created_at,
        },
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
