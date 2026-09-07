import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizeSafeLocalPath } from '@/lib/sanitize'
import {
  createCommentSchema,
  editCommentSchema,
  createRequestSchema,
  createTutorialSchema,
} from '@/lib/validations'

describe('Security: Sanitization against XSS and Open Redirect', () => {
  it('escapes dangerous HTML and script tags from text input', () => {
    const maliciousInput = '<script>alert("XSS")</script>'
    const sanitized = sanitizeText(maliciousInput)

    expect(sanitized).not.toContain('<script>')
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
  })

  it('handles empty or blank input gracefully', () => {
    expect(sanitizeText('')).toBe('')
    expect(sanitizeText('   ')).toBe('')
  })

  it('neutralizes Open Redirect attempts targeting external domains', () => {
    expect(sanitizeSafeLocalPath('https://malicious-domain.com')).toBe('/')
    expect(sanitizeSafeLocalPath('//malicious-domain.com')).toBe('/')
    expect(sanitizeSafeLocalPath('/\\malicious-domain.com')).toBe('/')
    expect(sanitizeSafeLocalPath('http://phishing.site/login')).toBe('/')
    expect(sanitizeSafeLocalPath(null)).toBe('/')
    expect(sanitizeSafeLocalPath(undefined)).toBe('/')
  })

  it('permits valid internal application paths', () => {
    expect(sanitizeSafeLocalPath('/')).toBe('/')
    expect(sanitizeSafeLocalPath('/perguntas')).toBe('/perguntas')
    expect(sanitizeSafeLocalPath('/tutorial/123?page=2')).toBe('/tutorial/123?page=2')
    expect(sanitizeSafeLocalPath('/admin')).toBe('/admin')
  })
})

describe('Validation: Zod Schemas', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000'

  describe('createCommentSchema', () => {
    it('accepts valid comment payload', () => {
      const result = createCommentSchema.safeParse({
        tutorialId: validUUID,
        content: 'Este tutorial foi muito útil!',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid tutorialId that is not a UUID', () => {
      const result = createCommentSchema.safeParse({
        tutorialId: 'invalid-id-format',
        content: 'Comentário válido',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty or whitespace-only content', () => {
      const result = createCommentSchema.safeParse({
        tutorialId: validUUID,
        content: '   ',
      })
      expect(result.success).toBe(false)
    })

    it('rejects content exceeding maximum limit', () => {
      const result = createCommentSchema.safeParse({
        tutorialId: validUUID,
        content: 'a'.repeat(2001),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createRequestSchema', () => {
    it('accepts valid tutorial request', () => {
      const result = createRequestSchema.safeParse({
        title: 'Como usar Next.js 16',
        description: 'Gostaria de um tutorial explicando Server Actions no Next.js 16.',
        category: 'Tecnologia',
      })
      expect(result.success).toBe(true)
    })

    it('rejects short title or short description', () => {
      const result = createRequestSchema.safeParse({
        title: 'Oi',
        description: 'Curto',
        category: 'Tecnologia',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createTutorialSchema', () => {
    it('accepts valid tutorial payload with steps', () => {
      const result = createTutorialSchema.safeParse({
        title: 'Guia Completo de Git',
        description: 'Aprenda comandos básicos e avançados de versionamento.',
        category: 'Tecnologia',
        steps: ['Instale o git', 'Execute git init', 'Crie o primeiro commit'],
      })
      expect(result.success).toBe(true)
    })

    it('rejects tutorial with empty steps array', () => {
      const result = createTutorialSchema.safeParse({
        title: 'Guia Completo de Git',
        description: 'Aprenda comandos básicos e avançados de versionamento.',
        category: 'Tecnologia',
        steps: [],
      })
      expect(result.success).toBe(false)
    })
  })
})
