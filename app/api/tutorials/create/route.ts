import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { createTutorialSchema } from '@/lib/validations'
import { sanitizeText } from '@/lib/sanitize'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const json = await request.json()
    const parseResult = createTutorialSchema.safeParse(json)

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Dados inválidos'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { title, description, category, steps } = parseResult.data

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, banned')
      .eq('id', user.id)
      .single()

    if (profile?.banned) {
      return NextResponse.json({ error: 'Usuário banido não pode publicar tutoriais.' }, { status: 403 })
    }

    const isAdmin = profile?.role === 'ADMIN'

    // Sanitização preventiva de textos contra ataques XSS
    const sanitizedTitle = sanitizeText(title)
    const sanitizedDescription = sanitizeText(description)
    const sanitizedSteps = steps.map((s) => sanitizeText(s))

    const service = createServiceRoleClient()
    const { data, error } = await service
      .from('tutorials')
      .insert({
        title: sanitizedTitle,
        description: sanitizedDescription,
        steps: sanitizedSteps,
        author_id: user.id,
        category,
        approved: isAdmin,
        upvotes: 0,
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Falha ao criar tutorial', { userId: user.id, error: error.message })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info('Tutorial criado com sucesso', { tutorialId: data.id, userId: user.id, approved: isAdmin })
    return NextResponse.json({ ok: true, id: data.id, approved: isAdmin })
  } catch (err: any) {
    logger.error('Exceção ao criar tutorial', { error: err?.message })
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}