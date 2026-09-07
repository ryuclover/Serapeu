import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { createRequestSchema } from '@/lib/validations'
import { sanitizeText } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { checkRateLimit, RATE_LIMIT_RULES, rateLimitResponse } from '@/lib/ratelimit'
import { moderateContent } from '@/lib/moderation'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Você precisa estar autenticado.' }, { status: 401 })
    }

    // 1. Rate Limit (10 pedidos por 10 minutos por usuário)
    const rateLimit = checkRateLimit(`request-create:${user.id}`, RATE_LIMIT_RULES.REQUEST_CREATE)
    if (!rateLimit.success) {
      logger.warn('Rate limit de pedidos excedido', { userId: user.id })
      return rateLimitResponse(rateLimit)
    }

    // 2. Validação com Zod
    const json = await request.json()
    const parseResult = createRequestSchema.safeParse(json)

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Dados inválidos'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { title, description, category } = parseResult.data

    // 3. Verificação de status da conta
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, banned')
      .eq('id', user.id)
      .single()

    if (profile?.banned) {
      return NextResponse.json(
        { error: 'Sua conta está suspensa e não pode criar novas requisições.' },
        { status: 403 }
      )
    }

    // 4. Moderação automática de conteúdo
    const combinedContent = `${title}\n${description}`
    const moderation = moderateContent(combinedContent)
    if (!moderation.allowed) {
      logger.warn('Pedido rejeitado pela moderação de conteúdo', {
        userId: user.id,
        reason: moderation.reason,
        category: moderation.category,
      })
      return NextResponse.json(
        { error: moderation.reason || 'Conteúdo em desacordo com as diretrizes da plataforma.' },
        { status: 422 }
      )
    }

    // 5. Sanitização preventiva de textos contra XSS
    const sanitizedTitle = sanitizeText(title)
    const sanitizedDescription = sanitizeText(description)

    // 6. Inserção segura via service role
    const service = createServiceRoleClient()
    const { data, error } = await service
      .from('tutorial_requests')
      .insert({
        user_id: user.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        category,
        upvotes: 0,
      })
      .select('*, profiles(name)')
      .single()

    if (error) {
      logger.error('Erro ao salvar requisição no banco', { userId: user.id, error: error.message })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info('Requisição criada com sucesso', { requestId: data.id, userId: user.id })
    return NextResponse.json({ success: true, request: data })
  } catch (err: any) {
    logger.error('Exceção ao criar requisição de tutorial', { error: err?.message })
    return NextResponse.json({ error: err?.message || 'Erro interno no servidor' }, { status: 500 })
  }
}
