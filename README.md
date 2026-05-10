# Serapeu

Plataforma colaborativa para compartilhar tutoriais passo a passo, pedir novos conteúdos e moderar publicações via painel administrativo.

## ✨ Funcionalidades

- Feed de tutoriais com busca e filtro por categoria
- Criação de tutoriais por usuários autenticados
- Área de perguntas/requisições com sistema de upvote
- Comentários e relato de problemas em tutoriais
- Salvamento de tutoriais favoritos
- Fluxo de autenticação com Supabase (email/senha + OAuth)
- Painel admin para aprovação, moderação e gestão de usuários
- Interface com tema escuro

## 🧱 Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Supabase** (Auth + banco)
- **Tailwind CSS 4** + componentes com Radix UI

## 📁 Estrutura principal

- `app/`: rotas e páginas
- `components/`: componentes de UI e layout
- `lib/`: contexto de autenticação, tipos e cliente Supabase
- `public/`: ícones e assets estáticos
- `*.sql`: scripts auxiliares para ajustes/migração no Supabase

## ✅ Pré-requisitos

- Node.js (recomendado: versão LTS atual)
- npm
- Projeto Supabase configurado

## ⚙️ Configuração local

1. Instale dependências:

```bash
npm ci
```

2. Crie o arquivo `.env.local` na raiz com:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Rode em desenvolvimento:

```bash
npm run dev
```

Aplicação disponível em `http://localhost:3000`.

## 📜 Scripts

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera build de produção
- `npm run start`: inicia a aplicação em produção
- `npm run lint`: executa lint do projeto

## 🗄️ Supabase

O projeto possui scripts SQL auxiliares na raiz para correções e ajustes de dados/policies, incluindo:

- `SUPABASE_FIX.md`
- `supabase-reset.sql`
- `supabase-fix-profiles-recursion.sql`
- `fix_saved_tutorials.sql`

Se ocorrer erro de recursão de policy (`42P17`) na tabela `profiles`, siga o guia em `SUPABASE_FIX.md`.

## 🚀 Deploy

Fluxo recomendado:

1. Configurar as mesmas variáveis de ambiente no provedor de deploy
2. Garantir que o projeto Supabase esteja acessível
3. Executar `npm run build`
4. Publicar (ex.: Vercel)

---

Feito com foco em compartilhamento de conhecimento prático em comunidade.
