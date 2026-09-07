import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tutorialId, content } = body || {}

    if (!tutorialId || !content) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabaseAuth = createRouteHandlerClient(request)

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const service = createServiceRoleClient()

    // Verify user is not banned
    const { data: profile } = await service
      .from('profiles')
      .select('name, banned')
      .eq('id', user.id)
      .single()

    if (profile?.banned) {
      return NextResponse.json({ error: 'Usuário banido não pode comentar' }, { status: 403 })
    }

    const trimmedContent = typeof content === 'string' ? content.trim() : ''
    if (!trimmedContent) {
      return NextResponse.json({ error: 'Comentário não pode ser vazio' }, { status: 400 })
    }

    const { data, error } = await service
      .from('comments')
      .insert({
        tutorial_id: tutorialId,
        user_id: user.id,
        user_name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        content: trimmedContent,
      })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, comment: data }, { status: 200 })
  } catch (err: any) {
    console.error('[Comments] Exception:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
