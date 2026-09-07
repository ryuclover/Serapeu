import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { user, service, errorResponse } = await requireAdminSession(request)
    if (errorResponse || !service || !user) return errorResponse

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    if (id === user.id) {
      return NextResponse.json({ error: 'Você não pode excluir a sua própria conta de administrador.' }, { status: 400 })
    }

    // Delete profile row
    const { error } = await service.from('profiles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

