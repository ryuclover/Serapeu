import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // Busca tutoriais aprovados
    const { data: tutorialsData, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (tutorialsError) throw tutorialsError

    // Busca comentários
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')

    // Busca problemas
    const { data: problemsData } = await supabase
      .from('tutorial_problems')
      .select('*')

    // Busca requisições
    const { data: requestsData } = await supabase
      .from('tutorial_requests')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      tutorials: tutorialsData || [],
      comments: commentsData || [],
      problems: problemsData || [],
      requests: requestsData || [],
    })
  } catch (error: any) {
    console.error('[Public Data] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
