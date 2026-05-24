import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware de Autenticação
 * IMPORTANTE: deve rodar em TODAS as rotas para que o @supabase/ssr
 * consiga renovar o cookie de sessão a cada requisição.
 * Sem isso, abrir uma nova aba não recupera o estado de login.
 *
 * Rotas protegidas:
 * - /admin/* (apenas ADMIN)
 * - /criar (apenas autenticado)
 * - /perfil (apenas autenticado)
 * - /salvos (apenas autenticado)
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas exceto:
     * - arquivos estáticos (_next/static, _next/image, favicon, etc)
     * - chamadas de API internas do Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
