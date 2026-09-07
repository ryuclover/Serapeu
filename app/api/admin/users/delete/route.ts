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

    // Soft-delete profile row and anonymize public identifier to preserve knowledge contributions
    const { error } = await service
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        name: 'Usuário Removido',
        banned: true,
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

