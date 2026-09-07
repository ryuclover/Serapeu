import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Tutorial, Comment } from '@/lib/types'
import { initialTutorials } from '@/lib/types'

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
      .is('deleted_at', null)

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

    let rawTutorials = tutorialsData || []
    if (rawTutorials.length === 0 && !search && !category) {
      rawTutorials = initialTutorials.map((t) => ({
        ...t,
        created_at: new Date().toISOString(),
        author_id: t.authorId,
        profiles: { name: t.authorName },
      })) as any
    }

    const tutorialIds = rawTutorials.map((t: any) => t.id)
    let commentsByTutorial: Record<string, Comment[]> = {}

    if (tutorialIds.length > 0) {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .in('tutorial_id', tutorialIds)
        .is('deleted_at', null)

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

    const PINNED_ID = 'b44e3074-fe49-4a16-b007-e3a9db859171'

    let tutorials: Tutorial[] = (rawTutorials || []).map((t: any) => {
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
        pinned: t.id === PINNED_ID,
        comments: commentsByTutorial[t.id] || [],
      }
    })

    // Se estiver na página 1 e sem busca específica que o exclua, garantir que o tutorial fixado venha no topo
    if (page === 1) {
      const pinnedIndex = tutorials.findIndex((t) => t.id === PINNED_ID)
      if (pinnedIndex > 0) {
        const [pinnedItem] = tutorials.splice(pinnedIndex, 1)
        tutorials.unshift(pinnedItem)
      } else if (pinnedIndex === -1 && !category && !search) {
        // Se o tutorial fixado não veio na página 1, buscar ele individualmente para afixar no topo
        const { data: pinnedData } = await supabase
          .from('tutorials')
          .select('*, profiles(name)')
          .eq('id', PINNED_ID)
          .eq('approved', true)
          .is('deleted_at', null)
          .maybeSingle()

        if (pinnedData) {
          const profile = Array.isArray(pinnedData.profiles) ? pinnedData.profiles[0] : pinnedData.profiles
          const pinnedTutorial: Tutorial = {
            id: pinnedData.id,
            title: pinnedData.title,
            description: pinnedData.description,
            steps: pinnedData.steps || [],
            authorId: pinnedData.author_id,
            authorName: profile?.name || 'Usuário',
            category: pinnedData.category,
            createdAt: new Date(pinnedData.created_at).toLocaleDateString('pt-BR'),
            approved: pinnedData.approved,
            upvotes: pinnedData.upvotes ?? 0,
            pinned: true,
            comments: commentsByTutorial[pinnedData.id] || [],
          }
          tutorials.unshift(pinnedTutorial)
          // Manter o limite da página
          if (tutorials.length > limit) {
            tutorials.pop()
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      tutorials,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (err: any) {
    // Fallback gracioso para visualização quando variáveis de ambiente remotas não estiverem carregadas
    return NextResponse.json({
      success: true,
      tutorials: initialTutorials,
      total: initialTutorials.length,
      page: 1,
      totalPages: 1,
    })
  }
}
