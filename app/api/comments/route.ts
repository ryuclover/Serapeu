import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tutorialId, content } = body || {}

    if (!tutorialId || !content) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            /* noop */
          },
        },
      },
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Use service role to insert comment (avoid RLS issues)
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    )

    const { data, error } = await service
      .from('comments')
      .insert({
        tutorial_id: tutorialId,
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        content,
      })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, comment: data }, { status: 200 })
  } catch (err: any) {
    console.error('[Comments] Exception:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
