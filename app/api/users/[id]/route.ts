import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Tutorial } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

    const supabase = createServiceRoleClient()

    // 1. Perfil público
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, role, created_at')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    // 2. Tutoriais do autor
    const { data: tutorialsData, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*')
      .eq('author_id', id)
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (tutorialsError) {
      return NextResponse.json({ error: tutorialsError.message }, { status: 500 })
    }

    const tutorials: Tutorial[] = (tutorialsData || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      steps: t.steps || [],
      authorId: t.author_id,
      authorName: profile.name,
      category: t.category,
      createdAt: new Date(t.created_at).toLocaleDateString('pt-BR'),
      approved: t.approved,
      upvotes: t.upvotes ?? 0,
      comments: [],
    }))

    const totalUpvotes = tutorials.reduce((acc, t) => acc + (t.upvotes || 0), 0)

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        role: profile.role,
        createdAt: new Date(profile.created_at).toLocaleDateString('pt-BR'),
        totalTutorials: tutorials.length,
        totalUpvotes,
      },
      tutorials,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
