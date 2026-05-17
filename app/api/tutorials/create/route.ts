import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/server'

type CreateTutorialBody = {
  title?: string
  description?: string
  category?: string
  steps?: string[]
}

import { z } from 'zod'

const tutorialSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório.').max(100, 'Título muito longo.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  category: z.string().min(1, 'A categoria é obrigatória.'),
  steps: z.array(z.string().trim().min(1)).min(1, 'Adicione pelo menos um passo.'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            /* noop */
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const json = await request.json()
    const parseResult = tutorialSchema.safeParse(json)

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

    const service = createServiceRoleClient()
    const { data, error } = await service
      .from('tutorials')
      .insert({
        title,
        description,
        steps,
        author_id: user.id,
        category,
        approved: isAdmin,
        upvotes: 0,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id, approved: isAdmin })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}