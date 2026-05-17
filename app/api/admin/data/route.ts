import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Tutorial, UserType, TutorialProblem, TutorialRequest } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() { /* noop */ },
        },
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Use service role to check role to avoid RLS recursion
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    )
    
    const { data: profile } = await serviceRoleClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    console.log('[Admin Data] Fetching all admin data with service role...')
    
    // Use the already created serviceRoleClient (renamed from supabase)
    const supabase = serviceRoleClient;

    // Fetch tutorials
    console.log('[Admin Data] Fetching tutorials...')
    const { data: tutorialsData, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    if (tutorialsError) {
      console.warn('[Admin Data] Tutorials error:', tutorialsError)
      return NextResponse.json({ tutorials: [], error: tutorialsError.message }, { status: 200 })
    }

    // Format tutorials
    const tutorials: Tutorial[] = ((tutorialsData || []) as any[]).map((t) => {
      const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        steps: t.steps || [],
        authorId: t.author_id,
        authorName: profile?.name || 'Usuário',
        category: t.category,
        createdAt: new Date(t.created_at).toLocaleDateString('pt-BR'),
        approved: t.approved,
        upvotes: t.upvotes ?? 0,
        comments: [],
      }
    })

    // Fetch users
    console.log('[Admin Data] Fetching users...')
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.warn('[Admin Data] Users error:', usersError)
      return NextResponse.json({ tutorials, users: [], error: usersError.message }, { status: 200 })
    }

    // Format users
    const users: UserType[] = ((usersData || []) as any[]).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as 'USER' | 'ADMIN',
      createdAt: new Date(u.created_at).toLocaleDateString('pt-BR'),
      banned: Boolean(u.banned),
    }))

    // Fetch comments
    console.log('[Admin Data] Fetching comments...')
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')

    if (commentsError) {
      console.warn('[Admin Data] Comments error:', commentsError)
    }

    // Fetch problems
    console.log('[Admin Data] Fetching problems...')
    const { data: problemsData, error: problemsError } = await supabase
      .from('tutorial_problems')
      .select('*')

    if (problemsError) {
      console.warn('[Admin Data] Problems error:', problemsError)
    }

    // Fetch requests
    console.log('[Admin Data] Fetching requests...')
    const { data: requestsData, error: requestsError } = await supabase
      .from('tutorial_requests')
      .select('*, profiles(name)')

    if (requestsError) {
      console.warn('[Admin Data] Requests error:', requestsError)
    }

    console.log('[Admin Data] Success! Returned data:', {
      tutorials: tutorials.length,
      users: users.length,
      comments: (commentsData || []).length,
      problems: (problemsData || []).length,
      requests: (requestsData || []).length,
    })

    return NextResponse.json({
      success: true,
      tutorials,
      users,
      comments: commentsData || [],
      problems: problemsData || [],
      requests: requestsData || [],
    })
  } catch (err: any) {
    console.error('[Admin Data] Exception:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
