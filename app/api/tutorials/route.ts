import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Tutorial, Comment } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = createServiceRoleClient()

    let query = supabase
      .from('tutorials')
      .select('*, profiles(name)', { count: 'exact' })
      .eq('approved', true)

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      const sanitizedSearch = search.replace(/[,()]/g, '').trim()
      if (sanitizedSearch) {
        query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`)
      }
    }

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data: tutorialsData, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const tutorialIds = (tutorialsData || []).map((t) => t.id)
    let commentsByTutorial: Record<string, Comment[]> = {}

    if (tutorialIds.length > 0) {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .in('tutorial_id', tutorialIds)

      commentsByTutorial = ((commentsData || []) as any[]).reduce((acc, c) => {
        if (!acc[c.tutorial_id]) acc[c.tutorial_id] = []
        acc[c.tutorial_id].push({
          id: c.id,
          tutorialId: c.tutorial_id,
          userId: c.user_id,
          userName: c.user_name,
          content: c.content,
          createdAt: new Date(c.created_at).toLocaleDateString('pt-BR'),
        })
        return acc
      }, {} as Record<string, Comment[]>)
    }

    const tutorials: Tutorial[] = (tutorialsData || []).map((t: any) => {
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
        comments: commentsByTutorial[t.id] || [],
      }
    })

    return NextResponse.json({
      success: true,
      tutorials,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
