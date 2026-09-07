# 📋 TODO — Serapeu Development Roadmap

> **Branch ativa:** feature/supabase-migration
> **Atualizado:** 10/04/2026
> **Status geral:** MVP 70% completo
> Inspeção local mostrou rotas funcionais, mas dados e autorização ainda precisam ser validados.

---

## 🚧 Plano Atual de Trabalho

1. Confirmar autenticação e fluxos de conta no Supabase.
2. Validar carregamento de dados reais para tutoriais e requisições.
3. Revisar proteção de rotas admin e permissões do painel.
4. Ajustar empty states e seed de desenvolvimento.
5. Corrigir alertas de dev origin e recursos preloaded.

---

## 🔴 CRÍTICO — Problemas detectados na inspeção

- [x] **1. Carregamento de conteúdos reais**
  - Adicionada paginação e busca server-side no Supabase (`/api/tutorials`, `/api/tutorials/[id]`).
  - Home e página individual de tutorial integradas com fallbacks e spinners.
- [x] **2. Fluxo de autenticação**
  - Autenticação migrada para `@supabase/ssr` exclusivamente com cookies seguros (removido localStorage exposto).
  - Bloqueio imediato e enforcement de usuários banidos com logout automático e redirecionamento.
- [x] **3. Painel admin e controle de acesso**
  - Rotas de API protegidas com checagem de sessão e validação de banimento e role.
  - Painel com abas, busca e ações de moderação integradas.
- [x] **4. Empty states e mensagens de interface**
  - `/perguntas` atualizada com call-to-action dinâmico tanto para usuários logados quanto para visitantes criarem conta.
  - Telas `/offline`, `/manutencao` e `/acesso-negado` padronizadas.
- [x] **5. Configuração de dev / Next.js warnings**
  - Configurado `allowedDevOrigins: ['127.0.0.1', 'localhost']` em `next.config.mjs`.
  - Flags perigosas de `ignoreBuildErrors` e `unoptimized` removidas; build 100% validado.

---

## 🟠 ALTO — Ajustes imediatos de funcionalidade

- [x] Confirmação de integridade nos endpoints de criação/votos e relatórios de problemas.
- [x] Proteção e autorização em rotas de exclusão e edição de comentários e tutoriais.
- [x] Script de seed estruturado (`scripts/seed.ts` e `npm run seed`) com migration oficial (`supabase/migrations/0001_initial_schema.sql`).
- [x] Melhorias nas mensagens e tratamento de estados de erro nas páginas de auth.

---

## 🟡 MÉDIO — Próximos recursos após estabilizar o core

- [x] Implementar perfil público de usuário em `/usuario/[id]`.
- [x] Mostrar tutoriais criados, upvotes recebidos e contribuições por usuário no perfil público.
- [ ] Adicionar tags para tutoriais e filtro por tags.
- [x] Sistema de notificações e feedback com Sonner toaster.
- [x] Salvamento de tutoriais e lista de favoritos integrada ao perfil.

---

## 🟢 BAIXO — Extras e polish

- [ ] Sistema de badges/achievements.
- [ ] Upload de imagens para tutoriais.
- [ ] Testes automatizados (Jest / React Testing Library).
- [x] SEO com meta tags dinâmicas, sitemap (`app/sitemap.ts`) e robots (`app/robots.ts`).
- [x] Documentar setup e deploy no README e no relatório de execução.

---

## 📊 Dependências de Tarefas

```
#2 (Dados reais)
  ├─> #1 (Autenticação / auth)
  ├─> #3 (Admin / permissões)
  └─> #4 (UX / empty states)

#1 (Autenticação / auth)
  ├─> #3 (Admin / permissões)
  └─> #5 (Dev / warnings)
```

**Recomendação:** focar em autenticação + dados reais primeiro, depois polir admin e UX.

---

## 🚀 Estimativas de Esforço

| ID | Tarefa | Complexidade | Tempo Estimado | Prioridade |
|---|---|---|---|---|
| 1 | Autenticação Supabase | 🔴 Alta | 3-4h | 🔴 Crítico |
| 2 | Dados reais para Home e Perguntas | 🔴 Alta | 3-4h | 🔴 Crítico |
| 3 | Painel admin / permissões | 🟡 Média | 2-3h | 🔴 Crítico |
| 4 | Empty states e seed de dev | 🟢 Baixa | 1-2h | 🟠 Alto |
| 5 | Fix dev warnings | 🟢 Baixa | 1-2h | 🟠 Alto |
| 6 | Comentários / problemas / votos | 🟡 Média | 2-3h | 🟡 Médio |
| 7 | Perfil público | 🟡 Média | 2-3h | 🟡 Médio |
| 8 | Tags | 🔴 Alta | 3-4h | 🟡 Médio |
| 9 | Notificações | 🟡 Média | 2-3h | 🟡 Médio |
| 10 | Upload imagens | 🔴 Alta | 3-4h | 🟢 Baixo |
| 11 | Testes | 🔴 Alta | 4-5h | 🟢 Baixo |
| 12 | SEO | 🟢 Baixa | 2-3h | 🟢 Baixo |

**Total estimado:** ~30-40 horas de desenvolvimento

---

## ✅ Checklist por Tarefa

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
- **Git commits** descritivos: `feat: validar auth supabase`

---

**Última atualização:** 10/04/2026
**Próxima revisão:** Após validar auth e dados reais
