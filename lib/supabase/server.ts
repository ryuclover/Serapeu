import { createClient } from '@supabase/supabase-js'

/**
 * Cria um cliente Supabase com a Service Role Key (USAR APENAS NO SERVIDOR)
 * A chave deve estar definida em `SUPABASE_SERVICE_ROLE_KEY` no ambiente.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE service role environment variables')
  }

  return createClient(url, key)
}
