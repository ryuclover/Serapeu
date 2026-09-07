import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Tutorial, Comment } from '@/lib/types'
import { initialTutorials } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing tutorial id' }, { status: 400 })

    // Se id não for UUID (ex: seed local '1' ou '2'), resolve via initialTutorials
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (!isUuid) {
      const fallback = initialTutorials.find((t) => t.id === id)
      if (fallback) {
        return NextResponse.json({ success: true, tutorial: fallback })
      }
      return NextResponse.json({ error: 'Tutorial não encontrado' }, { status: 404 })
    }

    const supabase = createServiceRoleClient()

    const { data: tutorialData, error: tutorialError } = await supabase
      .from('tutorials')
      .select('*, profiles(name)')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()

    if (tutorialError || !tutorialData) {
      const fallback = initialTutorials.find((t) => t.id === id)
      if (fallback) {
        return NextResponse.json({ success: true, tutorial: fallback })
      }
      return NextResponse.json({ error: 'Tutorial não encontrado' }, { status: 404 })
    }

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('tutorial_id', id)
      .is('deleted_at', null)
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
