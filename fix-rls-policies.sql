-- Fix RLS Policies causing 500 errors in Supabase REST API
-- Execute this in Supabase SQL Editor

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
