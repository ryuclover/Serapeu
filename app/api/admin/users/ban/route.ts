import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { user, service, errorResponse } = await requireAdminSession(request)
    if (errorResponse || !service || !user) return errorResponse

    const { id, ban } = await request.json()
    if (!id || typeof ban !== 'boolean') {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (id === user.id) {
      return NextResponse.json({ error: 'Você não pode banir a sua própria conta.' }, { status: 400 })
    }

    const { error } = await service.from('profiles').update({ banned: ban }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

