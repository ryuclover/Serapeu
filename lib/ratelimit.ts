import { NextRequest, NextResponse } from 'next/server'

export interface RateLimitRule {
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface HitRecord {
  timestamps: number[]
}

/**
 * Motor de limitação de taxa em memória (Sliding Window Log).
 * Inclui expiração automática e limpeza de memória periódica.
 */
export class InMemoryRateLimiter {
  private hits = new Map<string, HitRecord>()
  private lastCleanup = Date.now()

  private cleanup(windowMs: number) {
    const now = Date.now()
    if (now - this.lastCleanup < 60000) return // Executa a cada 1 minuto
    this.lastCleanup = now

    for (const [key, record] of this.hits.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)
      if (record.timestamps.length === 0) {
        this.hits.delete(key)
      }
    }
  }

  public check(key: string, limit: number, windowMs: number): RateLimitResult {
    this.cleanup(windowMs)
    const now = Date.now()
    let record = this.hits.get(key)
    if (!record) {
      record = { timestamps: [] }
      this.hits.set(key, record)
    }

    // Filtra timestamps que ainda pertencem à janela atual
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

    if (record.timestamps.length >= limit) {
      const oldestHit = record.timestamps[0] || now
      const reset = Math.ceil((oldestHit + windowMs - now) / 1000)
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.max(1, reset),
      }
    }

    record.timestamps.push(now)
    const reset = Math.ceil(windowMs / 1000)
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - record.timestamps.length),
      reset,
    }
  }

  public reset(key?: string): void {
    if (key) {
      this.hits.delete(key)
    } else {
      this.hits.clear()
    }
  }
}

export const rateLimiterInstance = new InMemoryRateLimiter()

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

export const RATE_LIMIT_RULES = {
  // 5 tutoriais criados por hora por usuário/IP
  TUTORIAL_CREATE: { limit: 5, windowMs: 60 * 60 * 1000 },
  // 1 comentário a cada 10 segundos por usuário (anti-flood)
  COMMENT_CREATE: { limit: 1, windowMs: 10 * 1000 },
  // 20 votos por minuto por IP/usuário
  VOTE: { limit: 20, windowMs: 60 * 1000 },
  // 10 pedidos/problemas por 10 minutos
  REQUEST_CREATE: { limit: 10, windowMs: 10 * 60 * 1000 },
} as const

export function checkRateLimit(
  identifier: string,
  rule: RateLimitRule
): RateLimitResult {
  return rateLimiterInstance.check(identifier, rule.limit, rule.windowMs)
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Muitas requisições. Por favor, aguarde alguns segundos antes de tentar novamente.',
      retryAfterSeconds: result.reset,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.reset),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
      },
    }
  )
}
