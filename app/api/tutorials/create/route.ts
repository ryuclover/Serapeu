import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/server'

type CreateTutorialBody = {
  title?: string
  description?: string
  category?: string
  steps?: string[]
}

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

    const body = (await request.json()) as CreateTutorialBody
    const title = body?.title?.trim() ?? ''
    const description = body?.description?.trim() ?? ''
    const category = body?.category?.trim() ?? ''
    const steps = (body?.steps ?? []).map((step) => step.trim()).filter(Boolean)

    if (!title || !description || !category || steps.length === 0) {
      return NextResponse.json({ error: 'Dados inválidos para criação do tutorial.' }, { status: 400 })
    }

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