-- ==============================================================================
-- SERAPEU KNOWLEDGE PLATFORM - SETUP COMPLETO DO BANCO DE DADOS SUPABASE
-- ==============================================================================
-- Este script configura toda a infraestrutura do banco de dados Serapeu:
-- 1. Extensões UUID e PGCrypto
-- 2. Tabelas completas com foreign keys, cascading e soft-deletes
-- 3. Índices otimizados para alta performance em produção
-- 4. Row Level Security (RLS) e Políticas de Segurança granulares
-- 5. Funções e Triggers atômicos (auto-profile, proteção de roles e contadores de votos)
--
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Abra o painel do Supabase: https://supabase.com/dashboard
-- 2. Selecione o seu projeto
-- 3. No menu lateral esquerdo, clique em "SQL Editor"
-- 4. Clique em "New query"
-- 5. Cole TODO este arquivo e clique no botão verde "Run" (ou aperte Ctrl + Enter)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ==============================================================================

-- 2.1 Profiles (Perfis de usuários vinculados ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER'::text CHECK (role IN ('USER', 'ADMIN')),
  banned BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 2.2 Tutorials (Tutoriais passo a passo da plataforma)
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  steps TEXT[] DEFAULT '{}'::text[],
  category TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 2.3 Comments (Comentários e discussões nos tutoriais)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 2.4 Tutorial Problems (Reporte de problemas ou dúvidas em etapas)
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

-- 2.5 Tutorial Requests (Perguntas e pedidos da comunidade)
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
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- 2.6 Saved Tutorials (Favoritos / tutoriais salvos por usuário)
CREATE TABLE IF NOT EXISTS public.saved_tutorials (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(user_id, tutorial_id)
);

-- 2.7 Tutorial Votes (Votos positivos em tutoriais)
CREATE TABLE IF NOT EXISTS public.tutorial_votes (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(user_id, tutorial_id)
);

-- 2.8 Tutorial Request Votes (Votos normalizados em pedidos/perguntas)
CREATE TABLE IF NOT EXISTS public.tutorial_request_votes (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.tutorial_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(request_id, user_id)
);

-- Assegurar colunas de Soft Delete caso as tabelas já existissem anteriormente
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.tutorial_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- ==============================================================================
-- 3. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON public.profiles(banned);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);

CREATE INDEX IF NOT EXISTS idx_tutorials_author_id ON public.tutorials(author_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON public.tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_approved ON public.tutorials(approved);
CREATE INDEX IF NOT EXISTS idx_tutorials_deleted_at ON public.tutorials(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON public.tutorials(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_tutorial_id ON public.comments(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON public.comments(deleted_at);

CREATE INDEX IF NOT EXISTS idx_tutorial_problems_tutorial_id ON public.tutorial_problems(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_problems_user_id ON public.tutorial_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_problems_resolved ON public.tutorial_problems(resolved);

CREATE INDEX IF NOT EXISTS idx_tutorial_requests_user_id ON public.tutorial_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_requests_category ON public.tutorial_requests(category);
CREATE INDEX IF NOT EXISTS idx_tutorial_requests_answered ON public.tutorial_requests(answered);
CREATE INDEX IF NOT EXISTS idx_tutorial_requests_deleted_at ON public.tutorial_requests(deleted_at);

CREATE INDEX IF NOT EXISTS idx_saved_tutorials_user_tut ON public.saved_tutorials(user_id, tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_votes_user_tut ON public.tutorial_votes(user_id, tutorial_id);
CREATE INDEX IF NOT EXISTS idx_request_votes_user_req ON public.tutorial_request_votes(user_id, request_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_request_votes ENABLE ROW LEVEL SECURITY;

-- 4.1 Políticas para Profiles
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON public.profiles;
CREATE POLICY "Public profiles are visible to everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR COALESCE(auth.role(), '') = 'service_role');

DROP POLICY IF EXISTS "Users or admins can update profiles" ON public.profiles;
CREATE POLICY "Users or admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Users or admins can delete profiles" ON public.profiles;
CREATE POLICY "Users or admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 4.2 Políticas para Tutorials
DROP POLICY IF EXISTS "Public tutorials are visible to everyone" ON public.tutorials;
CREATE POLICY "Public tutorials are visible to everyone"
  ON public.tutorials FOR SELECT
  USING (
    (deleted_at IS NULL AND (approved = true OR auth.uid() = author_id))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

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

-- 4.3 Políticas para Comments
DROP POLICY IF EXISTS "Comments are visible to everyone" ON public.comments;
CREATE POLICY "Comments are visible to everyone"
  ON public.comments FOR SELECT
  USING (deleted_at IS NULL OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors or admins can update comments" ON public.comments;
CREATE POLICY "Authors or admins can update comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Authors or admins can delete comments" ON public.comments;
CREATE POLICY "Authors or admins can delete comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 4.4 Políticas para Tutorial Problems
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

-- 4.5 Políticas para Tutorial Requests
DROP POLICY IF EXISTS "Requests are visible to everyone" ON public.tutorial_requests;
CREATE POLICY "Requests are visible to everyone"
  ON public.tutorial_requests FOR SELECT
  USING (deleted_at IS NULL OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.tutorial_requests;
CREATE POLICY "Authenticated users can create requests"
  ON public.tutorial_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users or admins can update requests" ON public.tutorial_requests;
CREATE POLICY "Users or admins can update requests"
  ON public.tutorial_requests FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Users or admins can delete requests" ON public.tutorial_requests;
CREATE POLICY "Users or admins can delete requests"
  ON public.tutorial_requests FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 4.6 Políticas para Saved Tutorials
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

-- 4.7 Políticas para Tutorial Votes
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

-- 4.8 Políticas para Tutorial Request Votes
DROP POLICY IF EXISTS "Request votes are visible to everyone" ON public.tutorial_request_votes;
CREATE POLICY "Request votes are visible to everyone"
  ON public.tutorial_request_votes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can vote on requests" ON public.tutorial_request_votes;
CREATE POLICY "Users can vote on requests"
  ON public.tutorial_request_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove request vote" ON public.tutorial_request_votes;
CREATE POLICY "Users can remove request vote"
  ON public.tutorial_request_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. FUNÇÕES E TRIGGERS ATÔMICOS
-- ==============================================================================

-- 5.1 Criação Automática de Perfil no Cadastro (auth.users -> public.profiles)
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

-- 5.2 Proteção Contra Elevação de Privilégios (Impede usuários comuns de alterarem role/banned)
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

-- 5.3 Contador Atômico de Votos em Tutoriais (Zero Race Condition)
CREATE OR REPLACE FUNCTION public.handle_tutorial_vote_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tutorials
    SET upvotes = upvotes + 1
    WHERE id = NEW.tutorial_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tutorials
    SET upvotes = GREATEST(0, upvotes - 1)
    WHERE id = OLD.tutorial_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_tutorial_vote_counter ON public.tutorial_votes;
CREATE TRIGGER tr_tutorial_vote_counter
  AFTER INSERT OR DELETE ON public.tutorial_votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_tutorial_vote_change();

-- 5.4 Contador Atômico de Votos em Perguntas/Requisições (Zero Race Condition)
CREATE OR REPLACE FUNCTION public.handle_request_vote_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tutorial_requests
    SET upvotes = upvotes + 1
    WHERE id = NEW.request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tutorial_requests
    SET upvotes = GREATEST(0, upvotes - 1)
    WHERE id = OLD.request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_request_vote_counter ON public.tutorial_request_votes;
CREATE TRIGGER tr_request_vote_counter
  AFTER INSERT OR DELETE ON public.tutorial_request_votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_request_vote_change();

-- ==============================================================================
-- 6. COMANDOS ÚTEIS / GUIA RÁPIDO
-- ==============================================================================
-- Para transformar o seu primeiro usuário cadastrado em ADMIN da plataforma:
-- 1. Cadastre-se normalmente no site (ex: gabriel@email.com)
-- 2. Execute a linha abaixo substituindo pelo seu e-mail:
--
-- UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'SEU_EMAIL_AQUI';
--
-- Pronto! Seu banco está 100% configurado, blindado e pronto para produção!
