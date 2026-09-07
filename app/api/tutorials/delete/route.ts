import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body?.id || body?.tutorialId

    if (!id) {
      return NextResponse.json({ error: 'ID do tutorial obrigatório' }, { status: 400 })
    }

    const supabaseAuth = createRouteHandlerClient(request)
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const service = createServiceRoleClient()

    // 1. Buscar tutorial
    const { data: tutorial, error: fetchError } = await service
      .from('tutorials')
      .select('id, author_id, title')
      .eq('id', id)
      .single()

    if (fetchError || !tutorial) {
      return NextResponse.json({ error: 'Tutorial não encontrado' }, { status: 404 })
    }

    // 2. Buscar perfil do usuário para verificar role
    const { data: profile } = await service
      .from('profiles')
      .select('role, banned')
      .eq('id', user.id)
      .single()

    if (profile?.banned) {
      return NextResponse.json({ error: 'Sua conta está suspensa pela moderação' }, { status: 403 })
    }

    const isAuthor = tutorial.author_id === user.id
    const isAdmin = profile?.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      logger.warn('Tentativa não autorizada de exclusão de tutorial', {
        userId: user.id,
        tutorialId: id,
        authorId: tutorial.author_id,
      })
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este tutorial' },
        { status: 403 }
      )
    }

    // 3. Aplicar Soft-Delete
    const { error: deleteError } = await service
      .from('tutorials')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      logger.error('Erro ao excluir tutorial', { tutorialId: id, error: deleteError.message })
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    logger.info('Tutorial excluído com sucesso (soft-delete)', {
      tutorialId: id,
      deletedBy: user.id,
      isAuthor,
      isAdmin,
    })

    return NextResponse.json({ success: true, message: 'Tutorial excluído com sucesso' }, { status: 200 })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno do servidor'
    logger.error('Exceção ao excluir tutorial', { error: errorMsg })
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
