# 🔐 Guia de Configuração - Supabase

## Status Atual 🚨
O login OAuth não está funcionando porque as variáveis de ambiente do Supabase não foram configuradas.

Erro detectado:
```
Timeout ao trocar código por sessão. Verifique se as variáveis de ambiente estão configuradas.
```

---

## ✅ Passo a Passo - Configuração Local

### 1️⃣ Criar/Acessar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Crie um novo projeto ou selecione um existente
4. Aguarde o projeto inicializar (pode levar alguns minutos)

### 2️⃣ Obter as Credenciais
1. No painel do Supabase, vá para **Settings → API**
2. Copie:
   - **Project URL** (ex: `https://seu-projeto.supabase.co`)
   - **anon key** (chave pública)

### 3️⃣ Preencher `.env.local`
Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**Onde encontrar:**
- **Project URL**: Settings → API → Project URL
- **anon key**: Settings → API → Anon key (pública, segura compartilhar)
- **service role key**: Settings → API → Service role key (⚠️ PRIVADA, nunca commite!)

### 4️⃣ Configurar Redirect URLs do OAuth
No Supabase, em **Authentication → Providers → Google** (ou GitHub):

**Local (desenvolvimento):**
```
http://localhost:3000/auth/callback
```

**Produção (Vercel):**
```
https://serapeu.vercel.app/auth/callback
https://serapeu-xxxxx-gabrielzinhs-projects.vercel.app/auth/callback
```

### 5️⃣ Criar Tabelas do Banco de Dados

Execute o SQL abaixo em **SQL Editor** do Supabase:

```sql
-- ============ CRIAR EXTENSÕES ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ CRIAR TABELA PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER'::text,
  banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- ============ CRIAR TABELA TUTORIALS ============
CREATE TABLE public.tutorials (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  steps TEXT[] DEFAULT '{}'::text[],
  category TEXT,
  approved BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- ============ CRIAR TABELA COMMENTS ============
CREATE TABLE public.comments (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- ============ CRIAR TABELA TUTORIAL_PROBLEMS ============
CREATE TABLE public.tutorial_problems (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  step_number INTEGER,
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- ============ CRIAR TABELA TUTORIAL_REQUESTS ============
CREATE TABLE public.tutorial_requests (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  upvotes INTEGER DEFAULT 0,
  upvoted_by UUID[] DEFAULT '{}'::uuid[],
  answered BOOLEAN DEFAULT false,
  answered_tutorial_id UUID REFERENCES public.tutorials(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- ============ CRIAR TABELA SAVED_TUTORIALS ============
CREATE TABLE public.saved_tutorials (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(user_id, tutorial_id)
);

-- ============ CRIAR TABELA TUTORIAL_VOTES ============
CREATE TABLE public.tutorial_votes (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
  UNIQUE(user_id, tutorial_id)
);

-- ============ CRIAR ROW LEVEL SECURITY (RLS) ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_votes ENABLE ROW LEVEL SECURITY;

-- ============ POLÍTICAS RLS - PROFILES ============
CREATE POLICY "Public profiles are visible to everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============ POLÍTICAS RLS - TUTORIALS ============
CREATE POLICY "Public tutorials are visible to everyone"
  ON public.tutorials FOR SELECT
  USING (approved = true);

CREATE POLICY "Authors can view their own tutorials"
  ON public.tutorials FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create tutorials"
  ON public.tutorials FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own tutorials"
  ON public.tutorials FOR UPDATE
  USING (auth.uid() = author_id);

-- ============ POLÍTICAS RLS - COMMENTS ============
CREATE POLICY "Comments are visible to everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============ TRIGGER - CREATE PROFILE ON SIGN UP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'USER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6️⃣ Testar Localmente
```bash
npm run dev
# Abra http://localhost:3000/entrar
# Clique em "Google" ou "GitHub"
```

---

## 🚀 Configuração em Produção (Vercel)

### 1️⃣ Adicionar Variáveis no Vercel
1. Acesse o projeto em [vercel.com](https://vercel.com)
2. Vá para **Settings → Environment Variables**
3. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2️⃣ Redeployar
```bash
git push  # ou manual deploy no Vercel
```

### 3️⃣ Testar em Produção
- Acesse https://serapeu.vercel.app/entrar
- Clique em "Google" ou "GitHub"
- Você será redirecionado para o Google/GitHub
- Após autorizar, será redirecionado para `/auth/callback`
- Se tudo funcionar, será redirecionado para a home e logado ✅

---

## 🐛 Troubleshooting

### "Timeout ao trocar código por sessão"
**Solução:**
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
- Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
- Confirme que os Redirect URLs estão cadastrados no Supabase

### "Invalid API key"
**Solução:**
- A chave pode estar expirada ou inválida
- Gere uma nova no Supabase (Settings → API → Regenerate)

### Cookies não estão sendo salvos
**Solução:**
- Verifique se o navegador aceita cookies de terceiros
- Teste em modo incógnito
- Verifique as configurações de CORS do Supabase

---

## 📝 Resumo das Mudanças Implementadas

1. ✅ **Cliente Supabase cookie-aware**: `lib/supabase/client.ts` agora lê/escreve cookies corretamente
2. ✅ **Callback melhorado**: `app/auth/callback/page.tsx` com timeout e melhor debug
3. ✅ **Auth Context sincronizado**: `lib/auth-context.tsx` agora aguarda sessão corretamente
4. ✅ **Middleware de proteção**: Rotas `/admin`, `/criar`, `/perfil`, `/salvos` protegidas

---

## 📚 Recursos Úteis

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [OAuth Configuration](https://supabase.com/docs/guides/auth/social-login)
- [Next.js + Supabase Setup](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

**Status**: 🔴 Aguardando configuração do Supabase para testes completos
- -   C r e a t e   s a v e d _ t u t o r i a l s   t a b l e   i f   i t   d o e s n ' t   e x i s t  
 c r e a t e   t a b l e   i f   n o t   e x i s t s   s a v e d _ t u t o r i a l s   (  
     i d   u u i d   d e f a u l t   g e n _ r a n d o m _ u u i d ( )   p r i m a r y   k e y ,  
     u s e r _ i d   u u i d   r e f e r e n c e s   a u t h . u s e r s ( i d )   o n   d e l e t e   c a s c a d e   n o t   n u l l ,  
     t u t o r i a l _ i d   u u i d   r e f e r e n c e s   t u t o r i a l s ( i d )   o n   d e l e t e   c a s c a d e   n o t   n u l l ,  
     c r e a t e d _ a t   t i m e s t a m p   w i t h   t i m e   z o n e   d e f a u l t   t i m e z o n e ( ' u t c ' : : t e x t ,   n o w ( ) )   n o t   n u l l ,  
     u n i q u e ( u s e r _ i d ,   t u t o r i a l _ i d )  
 ) ;  
  
 - -   E n a b l e   R L S  
 a l t e r   t a b l e   s a v e d _ t u t o r i a l s   e n a b l e   r o w   l e v e l   s e c u r i t y ;  
  
 - -   D r o p   e x i s t i n g   p o l i c i e s   t o   a v o i d   c o n f l i c t s  
 d r o p   p o l i c y   i f   e x i s t s   " U s e r s   c a n   v i e w   t h e i r   o w n   s a v e d   t u t o r i a l s "   o n   s a v e d _ t u t o r i a l s ;  
 d r o p   p o l i c y   i f   e x i s t s   " U s e r s   c a n   s a v e   t u t o r i a l s "   o n   s a v e d _ t u t o r i a l s ;  
 d r o p   p o l i c y   i f   e x i s t s   " U s e r s   c a n   u n s a v e   t u t o r i a l s "   o n   s a v e d _ t u t o r i a l s ;  
  
 - -   C r e a t e   p o l i c i e s  
 c r e a t e   p o l i c y   " U s e r s   c a n   v i e w   t h e i r   o w n   s a v e d   t u t o r i a l s "  
     o n   s a v e d _ t u t o r i a l s   f o r   s e l e c t  
     u s i n g   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
  
 c r e a t e   p o l i c y   " U s e r s   c a n   s a v e   t u t o r i a l s "  
     o n   s a v e d _ t u t o r i a l s   f o r   i n s e r t  
     w i t h   c h e c k   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
  
 c r e a t e   p o l i c y   " U s e r s   c a n   u n s a v e   t u t o r i a l s "  
     o n   s a v e d _ t u t o r i a l s   f o r   d e l e t e  
     u s i n g   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 