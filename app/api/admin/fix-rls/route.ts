import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() { /* noop */ },
        },
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Initialize Supabase with service role key (admin access)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Execute SQL to fix RLS policies
    const sql = `
      BEGIN;
      
      -- Drop all problematic policies
      DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
      DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
      DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
      DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
      DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
      
      -- Drop problematic policies on tutorials
      DROP POLICY IF EXISTS "Tutorials are viewable by everyone" ON public.tutorials;
      DROP POLICY IF EXISTS "Users can create tutorials" ON public.tutorials;
      DROP POLICY IF EXISTS "Users can update their own tutorial" ON public.tutorials;
      DROP POLICY IF EXISTS "Admins can update any tutorial" ON public.tutorials;
      DROP POLICY IF EXISTS "Admins can delete tutorials" ON public.tutorials;
      
      -- Disable RLS temporarily to fix the data
      ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tutorials DISABLE ROW LEVEL SECURITY;
      
      -- Re-enable with simple policies
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
      
      -- Create simple, non-recursive policies for profiles
      CREATE POLICY "Profiles are viewable by everyone"
        ON public.profiles FOR SELECT
        USING (true);
      
      CREATE POLICY "Users can insert their own profile"
        ON public.profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
      
      CREATE POLICY "Users can update their own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
      
      -- Create simple, non-recursive policies for tutorials
      CREATE POLICY "Tutorials are viewable by everyone"
        ON public.tutorials FOR SELECT
        USING (true);
      
      CREATE POLICY "Users can create tutorials"
        ON public.tutorials FOR INSERT
        WITH CHECK (auth.uid() = author_id);
      
      CREATE POLICY "Users can update their own tutorial"
        ON public.tutorials FOR UPDATE
        USING (auth.uid() = author_id)
        WITH CHECK (auth.uid() = author_id);
      
      COMMIT;
    `

    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('[Fix RLS] Error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[Fix RLS] Success:', data)
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('[Fix RLS] Exception:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
