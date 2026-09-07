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
      tutorials: tutorialsData || [],
      comments: commentsData || [],
      problems: problemsData || [],
      requests,
    })
  } catch (error: any) {
    logger.warn('Retornando dados padrão de fallback (ambiente sem conexão remota ativa)', { error: error?.message })
    return NextResponse.json({
      success: true,
      tutorials: initialTutorials,
      comments: [],
      problems: [],
      requests: initialRequests,
    })
  }
}

