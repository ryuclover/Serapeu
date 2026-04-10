# 📋 TODO — Serapeu Development Roadmap

> **Branch ativa:** feature/supabase-migration
> **Atualizado:** 10/04/2026
> **Status geral:** MVP 60% completo
> Priorizado por impacto e dependências

---

## 🚧 Plano Atual de Trabalho

1. Validar e corrigir o RLS do Supabase para `profiles` (erro 42P17).
2. Confirmar que o app carrega tutoriais e requisições sem 500.
3. Completar migração de operações de tutorial para Supabase.
4. Migrar as requisições de tutorial para Supabase.
5. Implementar CRUD de comentários e problemas.

---

---

## 🔴 CRÍTICO — Core Data Persistence

Essas tarefas são **blockers** para o resto do projeto funcionar.

- [ ] **1. Migrar tutoriais para Supabase**
  - Mover de `initialTutorials` para queries ao banco
  - Criar tabela `tutorials` com schema completo
  - CRUD (Create, Read, Update, Delete)
  - Impacto: **MÁXIMO** — tudo depende disso

- [ ] **2. Migrar requisições para Supabase**
  - Mover de `initialRequests` para queries ao banco
  - Criar tabela `tutorial_requests`
  - Upvote/downvote persistente
  - Dependência: Após #1

- [x] **3. Implementar CRUD de comentários**
  - Criar tabela `comments` no Supabase
  - Componente de formulário de comentário
  - Listar comentários em tutorial
  - Deletar comentário (autor + admin)
  - Dependência: Após #1

- [x] **4. Persistir upvotes em Supabase**
  - Criar tabela `upvotes` (userId + tutorialId)
  - Incrementar/decrementar com save em DB
  - Remover mock do context
  - Impacto: **CRÍTICO** para dados corretos

- [x] **5. Persistir problemas em Supabase**
  - Criar tabela `tutorial_problems`
  - Salvar relatos do usuário
  - Listar problemas reportados (admin)
  - Marcar como resolvido
  - Dependência: Após #1

---

## 🟠 ALTO — Completar Features Existentes

Features planejadas que estão incompletas.

- [ ] **6. Adicionar delete buttons no admin**
  - Deletar tutorial (com confirmação)
  - Deletar requisição
  - Deletar usuário (soft delete)
  - Adicionar logs de deleção
  - Dependência: Após #1, #2

- [ ] **7. Preencher páginas vazias**
  - [ ] `/sobre` — Sobre a plataforma
  - [ ] `/email-confirmado` — Sucesso após confirmação
  - [ ] `/verifique-seu-email` — Instruções confirmação
  - [ ] `/manutencao` — Página de manutenção
  - [ ] `/offline` — Página offline
  - [ ] `/acesso-negado` — Acesso restrito

- [ ] **8. Implementar perfil público de usuários**
  - Criar rota `/usuario/[id]`
  - Mostrar tutoriais criados
  - Mostrar estatísticas (upvotes recebidos, contribuições)
  - Link para seguir (opcional)
  - Dependência: Após #1

---

## 🟡 MÉDIO — Engagement & UX

Features interessantes que melhoram experiência do usuário.

- [ ] **9. Criar sistema de notificações**
  - Novo comentário em tutorial que você criou
  - Tutorial aprovado/rejeitado
  - Resposta em requisição
  - Toast notifications (Sonner) — já setup
  - Opcional: email notifications (Supabase)

- [ ] **10. Implementar tags para tutoriais**
  - Criar tabela `tags`
  - Relação many-to-many `tutorial_tags`
  - UI para adicionar tags ao criar
  - Filtro por tags
  - Sugestões de tags populares

- [ ] **11. Busca avançada com filtros múltiplos**
  - Filtro por categoria (já existe)
  - Filtro por tags (após #10)
  - Filtro por data (recente/antigo)
  - Filtro por autor
  - Sort por relevância/upvotes/data
  - Salvar buscas (opcional)

---

## 🟢 BAIXO — Extras & Polish

Features nice-to-have, não blockers.

- [ ] **12. Sistema de badges/achievements**
  - Badge "Primeiro Tutorial"
  - Badge "100 Upvotes"
  - Badge "Power Contributor"
  - Display no perfil público
  - Gamification (opcional)

- [ ] **13. Adicionar upload de imagens**
  - Supabase Storage ou alternativa
  - Upload ao criar tutorial
  - Thumbnail no card
  - Zoom ao clicar
  - Validação de tamanho

- [ ] **14. Testes automatizados (Jest)**
  - Setup Jest + React Testing Library
  - Testes de componentes (card, navbar, form)
  - Testes de lógica (filtros, search)
  - Coverage mínimo: 60%
  - GitHub Actions para CI

- [ ] **15. SEO - meta tags dinâmicas**
  - next/head com título + descrição por página
  - og:image para compartilhamento
  - Schema.org para tutoriais
  - Robots.txt e sitemap.xml
  - Analytics (já tem Vercel Analytics)

---

## 📊 Dependências de Tarefas

```
#1 (Migrar tutoriais)
  ├─> #3 (Comentários)
  ├─> #4 (Upvotes)
  ├─> #5 (Problemas)
  ├─> #6 (Delete buttons)
  ├─> #8 (Perfil público)
  ├─> #10 (Tags)
  └─> #11 (Busca avançada)

#2 (Migrar requisições)
  └─> #6 (Delete buttons)
```

**Recomendação:** Fazer na ordem 1→2→3→4→5→6→7→8→9...

---

## 🚀 Estimativas de Esforço

| ID | Tarefa | Complexidade | Tempo Estimado | Prioridade |
|---|---|---|---|---|
| 1 | Migrar tutoriais | 🔴 Alta | 3-4h | 🔴 Crítica |
| 2 | Migrar requisições | 🟡 Média | 2-3h | 🔴 Crítica |
| 3 | CRUD comentários | 🔴 Alta | 3-4h | 🔴 Crítica |
| 4 | Upvotes persistente | 🟡 Média | 1-2h | 🔴 Crítica |
| 5 | Problemas Supabase | 🟡 Média | 2-3h | 🔴 Crítica |
| 6 | Delete buttons | 🟢 Baixa | 1-2h | 🟠 Alto |
| 7 | Páginas vazias | 🟢 Baixa | 2-3h | 🟠 Alto |
| 8 | Perfil público | 🟡 Média | 2-3h | 🟠 Alto |
| 9 | Notificações | 🟡 Média | 2-3h | 🟡 Médio |
| 10 | Tags | 🔴 Alta | 3-4h | 🟡 Médio |
| 11 | Busca avançada | 🔴 Alta | 3-4h | 🟡 Médio |
| 12 | Badges | 🟢 Baixa | 1-2h | 🟢 Baixo |
| 13 | Upload imagens | 🔴 Alta | 3-4h | 🟢 Baixo |
| 14 | Testes | 🔴 Alta | 4-5h | 🟢 Baixo |
| 15 | SEO | 🟢 Baixa | 2-3h | 🟢 Baixo |

**Total estimado:** ~45-55 horas de desenvolvimento

---

## ✅ Template de Checklist por Tarefa

Quando começar uma tarefa, use este template:

```markdown
## Tarefa #X: [Nome da Tarefa]

### Pré-requisitos
- [ ] Dependência #Y completa?

### Implementação
- [ ] Tabela/schema criado no Supabase
- [ ] Tipos TypeScript criados em lib/types.ts
- [ ] Funções CRUD implementadas
- [ ] Componentes UI criados
- [ ] Integração com AuthContext
- [ ] Tratamento de erros
- [ ] Toast feedback ao usuário

### Testes
- [ ] Funciona em desenvolvimento
- [ ] Funciona offline (se aplicável)
- [ ] Dark mode testado
- [ ] Responsividade testada

### Deploy
- [ ] Code review
- [ ] Deploy em staging
- [ ] Deploy em produção
```

---

## 📝 Notas Gerais

- **Sempre usar TypeScript** — sem `any`
- **Supabase queries** devem ter tipo explícito
- **Validação Zod** para todos os inputs
- **Dark mode** deve funcionar em tudo novo
- **Admin logs** devem ser adicionados para ações críticas
- **Git commits** descritivos: `feat: migrar tutoriais para Supabase`

---

**Última atualização:** 10/04/2026
**Próxima revisão:** Após completar #5
