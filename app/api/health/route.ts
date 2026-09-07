import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  let dbStatus: 'connected' | 'disconnected' = 'disconnected'
  let latencyMs = 0

  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)

    latencyMs = Date.now() - startTime
    if (!error) {
      dbStatus = 'connected'
    } else {
      logger.warn('Health check: falha ao consultar banco', { error: error.message })
    }
  } catch (err: any) {
    latencyMs = Date.now() - startTime
    logger.error('Health check: exceção ao verificar banco', { error: err?.message })
  }

  const isHealthy = dbStatus === 'connected'

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs,
      },
      environment: process.env.NODE_ENV || 'development',
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}
