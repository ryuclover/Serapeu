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

- [ ] **1. Carregamento de conteúdos reais**
  - A home mostra “Nenhum tutorial encontrado” em ambiente sem seed.
  - Não há dados de tutorial ou requisição visíveis mesmo com a rota funcionando.
  - Precisamos validar que o Supabase retorna e renderiza tutoriais, comentários e problemas.

- [ ] **2. Fluxo de autenticação**
  - O login, registro e páginas de verificação existem, mas precisam ser testados com credenciais reais.
  - Validar se `Entrar`, `Criar conta`, `verifique-seu-email` e `email-confirmado` estão integrados ao Supabase.
  - Confirmar se o registro requer aceitação de termos e se faz redirect correto.

- [ ] **3. Painel admin e controle de acesso**
  - A rota `/admin` está protegida, mas precisa ser verificada com usuário admin e usuário comum.
  - Confirmar se as ações de moderação estão disponíveis para admins e bloqueadas para outros.
  - Garantir que a UI admin seja carregada corretamente e sem erros.

- [ ] **4. Empty states e mensagens de interface**
  - `/perguntas` exibe empty state sem dados, mas falta orientação de chamada à ação para usuário logado.
  - Os estados offline, manutenção e acesso negado existem e devem ser polidos para consistência.
  - Realizar melhorias rápidas de UX nessas telas.

- [ ] **5. Configuração de dev / Next.js warnings**
  - O dev server mostra warning de `allowedDevOrigins` para `127.0.0.1`.
  - Há alertas de recursos preloaded não usados para `_next/static/chunks/...css`.
  - Corrigir configuração para evitar warnings no desenvolvimento local.

---

## 🟠 ALTO — Ajustes imediatos de funcionalidade

- [ ] Confirmar criação de requisições logadas e persistência de upvotes.
- [ ] Confirmar postagem de comentários e relatórios de problemas no tutorial.
- [ ] Garantir exclusão de tutorial/requisição/usuário em admin com confirmação.
- [ ] Adicionar importação/seed de demo para ambiente de desenvolvimento.
- [ ] Melhorar labels de botão e textos de ajuda nas telas de auth e autorizações.

---

## 🟡 MÉDIO — Próximos recursos após estabilizar o core

- [ ] Implementar perfil público de usuário em `/usuario/[id]`.
- [ ] Mostrar tutoriais criados, upvotes recebidos e contribuições por usuário.
- [ ] Adicionar tags para tutoriais e filtro por tags.
- [ ] Criar sistema de notificações leve (toasts + status de novas ações).
- [ ] Melhorar salvamento de tutoriais e lista de favoritos.

---

## 🟢 BAIXO — Extras e polish

- [ ] Sistema de badges/achievements.
- [ ] Upload de imagens para tutoriais.
- [ ] Testes automatizados (Jest / React Testing Library).
- [ ] SEO com meta tags dinâmicas e sitemap.
- [ ] Documentar setup e deploy no README.

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
