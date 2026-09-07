import { describe, expect, it, vi } from 'vitest'
import { initialTutorials, initialRequests } from '@/lib/types'

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => { throw new Error('Demo environment') },
}))
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn() } }))

import { GET } from '@/app/api/public/data/route'

describe('Public demo data contract', () => {
  it('preserves authors, dates, comments and votes for the public UI', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    for (const tutorial of initialTutorials) {
      const row = data.tutorials.find((item: { id: string }) => item.id === tutorial.id)
      expect(row.profiles.name).toBe(tutorial.authorName)
      expect(row.author_id).toBe(tutorial.authorId)
      expect(new Date(row.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })).toBe(tutorial.createdAt)
      expect(data.comments.filter((comment: { tutorial_id: string }) => comment.tutorial_id === tutorial.id)).toHaveLength(tutorial.comments?.length || 0)
    }
    for (const request of initialRequests) {
      const row = data.requests.find((item: { id: string }) => item.id === request.id)
      expect(row.profiles.name).toBe(request.userName)
      expect(row.upvoted_by).toEqual(request.upvotedBy)
      expect(Number.isNaN(Date.parse(row.created_at))).toBe(false)
    }
  })
})
