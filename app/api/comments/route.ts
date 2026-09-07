import { NextResponse, NextRequest } from 'next/server'
import { createRouteHandlerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { createCommentSchema } from '@/lib/validations'
import { sanitizeText } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = createCommentSchema.safeParse(body)

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || 'Payload inválido'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { tutorialId, content } = parseResult.data

    const supabaseAuth = createRouteHandlerClient(request)

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const service = createServiceRoleClient()

    // Verify user is not banned
    const { data: profile } = await service
      .from('profiles')
      .select('name, banned')
      .eq('id', user.id)
      .single()

    if (profile?.banned) {
      return NextResponse.json({ error: 'Usuário banido não pode comentar' }, { status: 403 })
    }

    const sanitizedContent = sanitizeText(content)

    const { data, error } = await service
      .from('comments')
      .insert({
        tutorial_id: tutorialId,
        user_id: user.id,
        user_name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        content: sanitizedContent,
      })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, comment: data }, { status: 200 })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
