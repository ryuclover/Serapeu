import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { Tutorial, UserType, TutorialProblem, TutorialRequest } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { service, errorResponse } = await requireAdminSession(request)
    if (errorResponse || !service) return errorResponse

    const supabase = service

    // Fetch tutorials (inclusive deletados para auditoria administrativa)
    const { data: tutorialsData, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    if (tutorialsError) {
      logger.warn('Erro ao carregar tutoriais no painel admin', { error: tutorialsError.message })
      return NextResponse.json({ tutorials: [], error: tutorialsError.message }, { status: 200 })
    }

    // Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (commentsError) {
      logger.warn('Erro ao carregar comentários no painel admin', { error: commentsError.message })
    }

    const commentsByTutorial = ((commentsData || []) as any[]).reduce((acc: Record<string, any[]>, c: any) => {
      if (!acc[c.tutorial_id]) acc[c.tutorial_id] = []
      acc[c.tutorial_id].push({
        id: c.id,
        tutorialId: c.tutorial_id,
        userId: c.user_id,
        userName: c.user_name,
        content: c.content,
        createdAt: new Date(c.created_at).toLocaleDateString('pt-BR'),
        deletedAt: c.deleted_at || null,
      })
      return acc
    }, {})

    // Format tutorials
    const tutorials: (Tutorial & { deletedAt?: string | null })[] = ((tutorialsData || []) as any[]).map((t) => {
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
        deletedAt: t.deleted_at || null,
      }
    })

    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      logger.warn('Erro ao carregar usuários no painel admin', { error: usersError.message })
      return NextResponse.json({ tutorials, users: [], error: usersError.message }, { status: 200 })
    }

    // Format users
    const users: (UserType & { deletedAt?: string | null })[] = ((usersData || []) as any[]).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as 'USER' | 'ADMIN',
      createdAt: new Date(u.created_at).toLocaleDateString('pt-BR'),
      banned: Boolean(u.banned),
      deletedAt: u.deleted_at || null,
    }))

    // Fetch problems
    const { data: problemsData, error: problemsError } = await supabase
      .from('tutorial_problems')
      .select('*')

    if (problemsError) {
      logger.warn('Erro ao carregar problemas no painel admin', { error: problemsError.message })
    }

    // Fetch requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('tutorial_requests')
      .select('*, profiles(name)')

    if (requestsError) {
      logger.warn('Erro ao carregar requisições no painel admin', { error: requestsError.message })
    }

    logger.info('Dados administrativos carregados com sucesso', {
      tutorialsCount: tutorials.length,
      usersCount: users.length,
      commentsCount: (commentsData || []).length,
      problemsCount: (problemsData || []).length,
      requestsCount: (requestsData || []).length,
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
    logger.error('Exceção ao buscar dados administrativos', { error: err?.message })
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}

