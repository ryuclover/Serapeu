import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { deleteCommentSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = deleteCommentSchema.safeParse(body)

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || 'Payload inválido'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { commentId } = parseResult.data

    const supabaseAuth = createRouteHandlerClient(request)

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // service role client for admin checks and safe deletes
    const service = createServiceRoleClient()

    // Fetch comment to check owner
    const { data: comment } = await service.from('comments').select('*').eq('id', commentId).single()

    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

    // Check if user is admin
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'ADMIN'

    if (!isAdmin && comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete: preserva registro para moderação e integridade
    const { error } = await service
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId)

    if (error) {
      logger.error('Falha ao aplicar soft-delete no comentário', { commentId, error: error.message })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info('Comentário removido (soft-delete)', { commentId, userId: user.id })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    logger.error('Exceção ao deletar comentário', { error: err?.message })
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

