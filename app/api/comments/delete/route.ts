import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tutorialId, commentId } = body || {}

    if (!tutorialId || !commentId) {
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

    // service role client for admin checks and safe deletes
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    )

    // Fetch comment to check owner
    const { data: comment } = await service.from('comments').select('*').eq('id', commentId).single()

    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

    // Check if user is admin
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'ADMIN'

    if (!isAdmin && comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await service.from('comments').delete().eq('id', commentId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Comments/Delete] Exception:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
