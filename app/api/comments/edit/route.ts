import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tutorialId, commentId, content } = body || {}

    if (!tutorialId || !commentId || !content) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabaseAuth = createRouteHandlerClient(request)

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const service = createServiceRoleClient()

    const { data: profile } = await service.from('profiles').select('role, banned').eq('id', user.id).single()
    if (profile?.banned) {
      return NextResponse.json({ error: 'Usuário banido não pode editar comentários' }, { status: 403 })
    }

    const { data: comment } = await service.from('comments').select('*').eq('id', commentId).single()
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

    const isAdmin = profile?.role === 'ADMIN'

    if (!isAdmin && comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await service.from('comments').update({ content }).eq('id', commentId).select('*').single()
    if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to update comment' }, { status: 500 })

    return NextResponse.json({ success: true, comment: data })
  } catch (err: any) {
    console.error('[Comments/Edit] Exception:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
