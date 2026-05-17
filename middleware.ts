import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware de Autenticação
 * Valida sessão do Supabase e protege rotas
 * 
 * Rotas protegidas:
 * - /admin/* (apenas ADMIN)
 * - /criar (apenas autenticado)
 * - /perfil (apenas autenticado)
 * - /salvos (apenas autenticado)
 */
export async function middleware(request: NextRequest) {
  // Atualiza a sessão do Supabase
  return await updateSession(request)
}

// Configurar quais rotas o middleware deve executar
export const config = {
  matcher: [
    // Protege rotas de admin
    '/admin/:path*',
    // Protege rotas de usuário logado
    '/criar',
    '/perfil',
    '/salvos',
  ],
}
