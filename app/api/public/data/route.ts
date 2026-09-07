import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { initialTutorials, initialRequests } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // 1. Busca tutoriais aprovados e não deletados
    const { data: tutorialsData, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .eq('approved', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (tutorialsError) throw tutorialsError

    const PINNED_ID = 'b44e3074-fe49-4a16-b007-e3a9db859171'
    let sortedTutorials = tutorialsData || []
    const pinnedIdx = sortedTutorials.findIndex((t: any) => t.id === PINNED_ID)
    if (pinnedIdx > 0) {
      const [pinnedItem] = sortedTutorials.splice(pinnedIdx, 1)
      sortedTutorials.unshift(pinnedItem)
    }

    // 2. Busca comentários ativos
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .is('deleted_at', null)

    // 3. Busca problemas relatados
    const { data: problemsData } = await supabase
      .from('tutorial_problems')
      .select('*')

    // 4. Busca requisições ativas
    const { data: requestsData } = await supabase
      .from('tutorial_requests')
      .select('*, profiles(name)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // 5. Busca votos associativos de requisições para hidratação correta
    const { data: requestVotes } = await supabase
      .from('tutorial_request_votes')
      .select('request_id, user_id')

    const votesByRequest: Record<string, string[]> = {}
    for (const v of requestVotes || []) {
      if (!votesByRequest[v.request_id]) votesByRequest[v.request_id] = []
      votesByRequest[v.request_id].push(v.user_id)
    }

    const requests = (requestsData || []).map((r) => ({
      ...r,
      upvoted_by: Array.from(
        new Set([...(r.upvoted_by || []), ...(votesByRequest[r.id] || [])])
      ),
    }))

    return NextResponse.json({
      success: true,
      tutorials: sortedTutorials,
      comments: commentsData || [],
      problems: problemsData || [],
      requests,
    })
  } catch (error: any) {
    logger.warn('Retornando dados padrão de fallback (ambiente sem conexão remota ativa)', { error: error?.message })
    return NextResponse.json({
      success: true,
      tutorials: initialTutorials.map((tutorial) => ({
        ...tutorial,
        author_id: tutorial.authorId,
        profiles: { name: tutorial.authorName },
        created_at: tutorial.createdAt.split('/').reverse().join('-') + 'T12:00:00Z',
      })),
      comments: initialTutorials.flatMap((tutorial) => (tutorial.comments || []).map((comment) => ({
        id: comment.id,
        tutorial_id: comment.tutorialId,
        user_id: comment.userId,
        user_name: comment.userName,
        content: comment.content,
        created_at: comment.createdAt.split('/').reverse().join('-') + 'T12:00:00Z',
      }))),
      problems: [],
      requests: initialRequests.map((request) => ({
        ...request,
        user_id: request.userId,
        profiles: { name: request.userName },
        upvoted_by: request.upvotedBy,
        answered_tutorial_id: request.answeredTutorialId,
      })),
    })
  }
}

