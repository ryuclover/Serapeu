import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for the browser that reads/writes cookies.
 * This is crucial for OAuth flows to work - the session cookie set by
 * exchangeCodeForSession() must be readable by subsequent requests.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/**
 * Helper to verify environment variables are set.
 * Call this early to catch configuration issues.
 */
export function validateSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('[Supabase Config] Missing env vars:', {
      hasUrl: !!url,
      hasKey: !!key,
    })
    throw new Error('Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
}
