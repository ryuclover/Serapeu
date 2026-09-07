-- =========================================================
-- MIGRATION: 0002_normalize_votes_and_soft_deletes.sql
-- Descrição: Soft deletes, normalização de votos e triggers atômicos
-- =========================================================

-- 1. Colunas de Soft Delete
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.tutorial_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Tabela associativa para votos em requisições (elimina coluna array upvoted_by UUID[])
CREATE TABLE IF NOT EXISTS public.tutorial_request_votes (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.tutorial_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(request_id, user_id)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.tutorial_request_votes ENABLE ROW LEVEL SECURITY;

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

-- 3. Triggers Atômicos para Contagem de Votos em Tutoriais (Zero Race Condition)
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

-- 4. Triggers Atômicos para Contagem de Votos em Requisições
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
