-- =========================================================
-- MIGRATION: 0001_initial_schema.sql
-- Descrição: Estrutura inicial do banco de dados Serapeu
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER'::text,
  banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 2. Tutorials
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  steps TEXT[] DEFAULT '{}'::text[],
  category TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 3. Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 4. Tutorial Problems
CREATE TABLE IF NOT EXISTS public.tutorial_problems (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  step_number INTEGER,
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 5. Tutorial Requests
CREATE TABLE IF NOT EXISTS public.tutorial_requests (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  upvoted_by UUID[] DEFAULT '{}'::uuid[],
  answered BOOLEAN DEFAULT false,
  answered_tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 6. Saved Tutorials
CREATE TABLE IF NOT EXISTS public.saved_tutorials (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(user_id, tutorial_id)
);

-- 7. Tutorial Votes
CREATE TABLE IF NOT EXISTS public.tutorial_votes (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(user_id, tutorial_id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_votes ENABLE ROW LEVEL SECURITY;

-- Políticas de perfis
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON public.profiles;
CREATE POLICY "Public profiles are visible to everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas de tutoriais
DROP POLICY IF EXISTS "Public tutorials are visible to everyone" ON public.tutorials;
CREATE POLICY "Public tutorials are visible to everyone"
  ON public.tutorials FOR SELECT
  USING (approved = true OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can create tutorials" ON public.tutorials;
CREATE POLICY "Users can create tutorials"
  ON public.tutorials FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors or admins can update tutorials" ON public.tutorials;
CREATE POLICY "Authors or admins can update tutorials"
  ON public.tutorials FOR UPDATE
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Authors or admins can delete tutorials" ON public.tutorials;
CREATE POLICY "Authors or admins can delete tutorials"
  ON public.tutorials FOR DELETE
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Políticas de comentários
DROP POLICY IF EXISTS "Comments are visible to everyone" ON public.comments;
CREATE POLICY "Comments are visible to everyone"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors or admins can delete comments" ON public.comments;
CREATE POLICY "Authors or admins can delete comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Políticas de requisições de tutoriais
DROP POLICY IF EXISTS "Requests are visible to everyone" ON public.tutorial_requests;
CREATE POLICY "Requests are visible to everyone"
  ON public.tutorial_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.tutorial_requests;
CREATE POLICY "Authenticated users can create requests"
  ON public.tutorial_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users or admins can update requests" ON public.tutorial_requests;
CREATE POLICY "Users or admins can update requests"
  ON public.tutorial_requests FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Políticas de problemas relatados
DROP POLICY IF EXISTS "Problems are visible to everyone" ON public.tutorial_problems;
CREATE POLICY "Problems are visible to everyone"
  ON public.tutorial_problems FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can report problems" ON public.tutorial_problems;
CREATE POLICY "Authenticated users can report problems"
  ON public.tutorial_problems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users, tutorial authors or admins can update problems" ON public.tutorial_problems;
CREATE POLICY "Users, tutorial authors or admins can update problems"
  ON public.tutorial_problems FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM public.tutorials WHERE id = tutorial_id AND author_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Users or admins can delete problems" ON public.tutorial_problems;
CREATE POLICY "Users or admins can delete problems"
  ON public.tutorial_problems FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Políticas de tutoriais salvos
DROP POLICY IF EXISTS "Users can view their own saved tutorials" ON public.saved_tutorials;
CREATE POLICY "Users can view their own saved tutorials"
  ON public.saved_tutorials FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save tutorials" ON public.saved_tutorials;
CREATE POLICY "Users can save tutorials"
  ON public.saved_tutorials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave tutorials" ON public.saved_tutorials;
CREATE POLICY "Users can unsave tutorials"
  ON public.saved_tutorials FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de votos em tutoriais
DROP POLICY IF EXISTS "Votes are visible to everyone" ON public.tutorial_votes;
CREATE POLICY "Votes are visible to everyone"
  ON public.tutorial_votes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can vote on tutorials" ON public.tutorial_votes;
CREATE POLICY "Users can vote on tutorials"
  ON public.tutorial_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their vote" ON public.tutorial_votes;
CREATE POLICY "Users can remove their vote"
  ON public.tutorial_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger de proteção: Impede usuários comuns de alterarem role e banned
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  BEGIN
    jwt_role := COALESCE(auth.role(), current_setting('request.jwt.claim.role', true), (current_setting('request.jwt.claims', true)::jsonb ->> 'role'));
  EXCEPTION WHEN OTHERS THEN
    jwt_role := COALESCE(auth.role(), 'authenticated');
  END;

  IF (current_user NOT IN ('postgres', 'supabase_admin') AND jwt_role != 'service_role') THEN
    NEW.role := OLD.role;
    NEW.banned := OLD.banned;
  END IF;
  NEW.updated_at := now() AT TIME ZONE 'UTC';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_roles ON public.profiles;
CREATE TRIGGER tr_protect_profile_roles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

-- Trigger de criação de perfil automático no cadastro (Role sempre padrão 'USER' para segurança)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    'USER'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

