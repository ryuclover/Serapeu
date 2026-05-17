import { NextResponse } from 'next/server'

/**
 * This endpoint provides manual instructions for disabling RLS policies
 * that are causing 500 errors in Supabase REST API.
 * 
 * RLS policies need to be disabled in the Supabase dashboard:
 * 1. Go to Project Settings → Database → Tables
 * 2. Select "profiles" table
 * 3. Click "Enable RLS" toggle to disable it
 * 4. Repeat for "tutorials" table
 * 
 * This is needed because the recursive policies are causing errors:
 * - Error 42P17: infinite recursion detected in policy for relation "profiles"
 * - Error 500: when REST API tries to read from tables
 */
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'RLS policies causing 500 errors',
    instruction: 'Disable RLS on profiles and tutorials tables in Supabase dashboard',
    steps: [
      'Go to https://supabase.com/dashboard',
      'Select project "serapeu"',
      'Navigate to: Project Settings → Database → Tables',
      'Select "profiles" table → Toggle RLS OFF',
      'Select "tutorials" table → Toggle RLS OFF',
      'Refresh the application',
    ],
    why: 'The current RLS policies have recursive definitions causing infinite loops',
    manual_sql: `
      -- Disable RLS on both tables
      ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tutorials DISABLE ROW LEVEL SECURITY;
      
      -- Then create simple non-recursive policies
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Profiles readable by all" ON public.profiles FOR SELECT USING (true);
      CREATE POLICY "Tutorials readable by all" ON public.tutorials FOR SELECT USING (true);
    `
  }, { status: 200 })
}
