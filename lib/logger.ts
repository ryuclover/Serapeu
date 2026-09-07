type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  metadata?: Record<string, unknown>
  error?: {
    message: string
    stack?: string
  }
}

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'key',
  'service_role',
  'cookie',
])

function maskSensitiveData(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData)
  }

  const cleanObj: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      cleanObj[key] = '***REDACTED***'
    } else if (typeof value === 'object' && value !== null) {
      cleanObj[key] = maskSensitiveData(value)
    } else {
      cleanObj[key] = value
    }
  }
  return cleanObj
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  private format(entry: LogEntry): void {
    if (this.isProduction) {
      // Formato JSON estruturado para Cloudwatch / Datadog / Logflare / Vercel
      console.log(JSON.stringify(entry))
    } else {
      // Formato legível para desenvolvimento local
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]${
        entry.context ? ` [${entry.context}]` : ''
      }`
      const meta = entry.metadata ? ` | Meta: ${JSON.stringify(entry.metadata)}` : ''

      if (entry.level === 'error') {
        console.error(`${prefix} ${entry.message}${meta}`, entry.error?.stack || '')
      } else if (entry.level === 'warn') {
        console.warn(`${prefix} ${entry.message}${meta}`)
      } else {
        console.log(`${prefix} ${entry.message}${meta}`)
      }
    }
  }

  public info(
    message: string,
    metadataOrContext?: string | Record<string, unknown>,
    context?: string
  ) {
    const isContextString = typeof metadataOrContext === 'string'
    const finalContext = isContextString ? metadataOrContext : context
    const finalMetadata = !isContextString ? metadataOrContext : undefined

    this.format({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context: finalContext,
      metadata: finalMetadata ? (maskSensitiveData(finalMetadata) as Record<string, unknown>) : undefined,
    })
  }

  public warn(
    message: string,
    metadataOrContext?: string | Record<string, unknown>,
    context?: string
  ) {
    const isContextString = typeof metadataOrContext === 'string'
    const finalContext = isContextString ? metadataOrContext : context
    const finalMetadata = !isContextString ? metadataOrContext : undefined

    this.format({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context: finalContext,
      metadata: finalMetadata ? (maskSensitiveData(finalMetadata) as Record<string, unknown>) : undefined,
    })
  }

  public error(
    message: string,
    errOrMetadata?: unknown,
    context?: string,
    metadata?: Record<string, unknown>
  ) {
    let errorDetails: { message: string; stack?: string } | undefined
    let finalMetadata = metadata
    const finalContext = context

    if (errOrMetadata instanceof Error) {
      errorDetails = { message: errOrMetadata.message, stack: errOrMetadata.stack }
    } else if (errOrMetadata && typeof errOrMetadata === 'object') {
      finalMetadata = { ...(errOrMetadata as Record<string, unknown>), ...metadata }
      const errProp = (errOrMetadata as Record<string, unknown>).error
      if (errProp) {
        errorDetails = { message: String(errProp) }
      }
    } else if (errOrMetadata !== undefined) {
      errorDetails = { message: String(errOrMetadata) }
    }

    this.format({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context: finalContext,
      metadata: finalMetadata ? (maskSensitiveData(finalMetadata) as Record<string, unknown>) : undefined,
      error: errorDetails,
    })
  }
}

export const logger = new Logger()
