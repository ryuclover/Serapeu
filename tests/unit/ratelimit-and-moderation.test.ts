import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryRateLimiter, rateLimitResponse } from '@/lib/ratelimit'
import { moderateContent } from '@/lib/moderation'

describe('Motor de Rate Limiting (Sliding Window)', () => {
  let limiter: InMemoryRateLimiter

  beforeEach(() => {
    limiter = new InMemoryRateLimiter()
  })

  it('permite requisições que estão dentro do limite da janela', () => {
    const res1 = limiter.check('user-1', 3, 1000)
    expect(res1.success).toBe(true)
    expect(res1.remaining).toBe(2)

    const res2 = limiter.check('user-1', 3, 1000)
    expect(res2.success).toBe(true)
    expect(res2.remaining).toBe(1)
  })

  it('bloqueia requisições quando o limite da janela é excedido', () => {
    limiter.check('user-2', 2, 2000)
    limiter.check('user-2', 2, 2000)

    const blockedRes = limiter.check('user-2', 2, 2000)
    expect(blockedRes.success).toBe(false)
    expect(blockedRes.remaining).toBe(0)
    expect(blockedRes.reset).toBeGreaterThan(0)
  })

  it('permite reset manual ou limpeza de chaves', () => {
    limiter.check('user-reset', 1, 5000)
    const blocked = limiter.check('user-reset', 1, 5000)
    expect(blocked.success).toBe(false)

    limiter.reset('user-reset')
    const allowedAfterReset = limiter.check('user-reset', 1, 5000)
    expect(allowedAfterReset.success).toBe(true)
  })

  it('gera resposta HTTP 429 com cabeçalhos padronizados de rate limit', async () => {
    const rateResult = {
      success: false,
      limit: 5,
      remaining: 0,
      reset: 30,
    }

    const response = rateLimitResponse(rateResult)
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('30')
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')

    const body = await response.json()
    expect(body.error).toContain('Muitas requisições')
    expect(body.retryAfterSeconds).toBe(30)
  })
})

describe('Motor de Moderação de Conteúdo', () => {
  it('aprova textos legítimos de tutoriais e comentários técnicos', () => {
    const text = `
      Como configurar Docker no Ubuntu:
      Passo 1: Atualize o apt com sudo apt update.
      Passo 2: Instale o pacote docker.io.
      Passo 3: Inicie o serviço com sudo systemctl start docker.
    `
    const result = moderateContent(text)
    expect(result.allowed).toBe(true)
    expect(result.flagged).toBe(false)
  })

  it('bloqueia e identifica domínios maliciosos de phishing e IP loggers', () => {
    const suspiciousText = 'Baixe o tutorial completo aqui: https://grabify.link/track123'
    const result = moderateContent(suspiciousText)
    expect(result.allowed).toBe(false)
    expect(result.flagged).toBe(true)
    expect(result.category).toBe('phishing')
    expect(result.reason).toContain('phishing')
  })

  it('bloqueia termos abusivos e ofensivos que violam as diretrizes', () => {
    const toxicText = 'Este tutorial ensina como fazer hackear conta de outros usuarios'
    const result = moderateContent(toxicText)
    expect(result.allowed).toBe(false)
    expect(result.flagged).toBe(true)
    expect(result.category).toBe('toxicity')
  })

  it('bloqueia publicações com repetição excessiva de caracteres', () => {
    const spamText = 'Opa galera tudo bem ' + 'a'.repeat(40) + ' me ajuda aqui'
    const result = moderateContent(spamText)
    expect(result.allowed).toBe(false)
    expect(result.flagged).toBe(true)
    expect(result.category).toBe('spam')
  })

  it('bloqueia publicações com mais de 5 links externos', () => {
    const linkSpam = `
      https://link1.com https://link2.com https://link3.com
      https://link4.com https://link5.com https://link6.com
    `
    const result = moderateContent(linkSpam)
    expect(result.allowed).toBe(false)
    expect(result.flagged).toBe(true)
    expect(result.category).toBe('spam')
  })
})
