import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Logger estruturado para erros
 * Loga com contexto e stack trace no console
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error(
    `❌ [${context}] ${errorMessage}`,
    {
      error: errorMessage,
      stack: errorStack,
      ...additionalInfo,
    }
  )
}

/**
 * Extrai mensagem de erro amigável para usuário
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Mensagens específicas de erro
    if (error.message.includes('infinite recursion')) {
      return 'Erro ao carregar dados. Tente novamente em alguns instantes.'
    }
    if (error.message.includes('UNIQUE constraint')) {
      return 'Este item já existe.'
    }
    if (error.message.includes('not authenticated')) {
      return 'Você não está autenticado. Faça login novamente.'
    }
    if (error.message.includes('permission denied')) {
      return 'Você não tem permissão para executar esta ação.'
    }
  }

  return 'Ocorreu um erro. Tente novamente mais tarde.'
}
