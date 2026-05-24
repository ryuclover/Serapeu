import { createBrowserClient } from '@supabase/ssr'

/**
 * Cria o cliente Supabase para o browser.
 *
 * Usa `createBrowserClient` do @supabase/ssr, que por padrão salva a sessão
 * em COOKIES (e não localStorage), garantindo que:
 * - Novas abas leem o mesmo cookie e recuperam o login automaticamente.
 * - O middleware Next.js consegue ler/renovar o token em cada request.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/**
 * Helper para verificar se as variáveis de ambiente estão configuradas.
 */
export function validateSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn('[Supabase Config] Missing env vars:', { hasUrl: !!url, hasKey: !!key })
    return false
  }
  return true
}
