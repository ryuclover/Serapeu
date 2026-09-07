import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Tutorial, Comment } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing tutorial id' }, { status: 400 })

    const supabase = createServiceRoleClient()

    const { data: tutorialData, error: tutorialError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .eq('id', id)
      .single()

    if (tutorialError || !tutorialData) {
      return NextResponse.json({ error: 'Tutorial não encontrado' }, { status: 404 })
    }

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('tutorial_id', id)
      .order('created_at', { ascending: true })

    const comments: Comment[] = (commentsData || []).map((c: any) => ({
      id: c.id,
      tutorialId: c.tutorial_id,
      userId: c.user_id,
      userName: c.user_name,
      content: c.content,
      createdAt: new Date(c.created_at).toLocaleDateString('pt-BR'),
    }))

    const profile = Array.isArray(tutorialData.profiles)
      ? tutorialData.profiles[0]
      : tutorialData.profiles

    const tutorial: Tutorial = {
      id: tutorialData.id,
      title: tutorialData.title,
      description: tutorialData.description,
      steps: tutorialData.steps || [],
      authorId: tutorialData.author_id,
      authorName: profile?.name || 'Usuário',
      category: tutorialData.category,
      createdAt: new Date(tutorialData.created_at).toLocaleDateString('pt-BR'),
      approved: tutorialData.approved,
      upvotes: tutorialData.upvotes ?? 0,
      comments,
    }

    return NextResponse.json({ success: true, tutorial })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
