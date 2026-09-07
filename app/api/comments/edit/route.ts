import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { editCommentSchema } from '@/lib/validations'
import { sanitizeText } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = editCommentSchema.safeParse(body)

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || 'Payload inválido'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { commentId, content } = parseResult.data

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

    const sanitizedContent = sanitizeText(content)

    const { data, error } = await service
      .from('comments')
      .update({ content: sanitizedContent })
      .eq('id', commentId)
      .select('*')
      .single()

    if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to update comment' }, { status: 500 })

    return NextResponse.json({ success: true, comment: data })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

