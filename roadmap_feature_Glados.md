# Roadmap da branch feature/Glados

## Objetivo
Criar uma visão clara do que precisa ser feito nesta branch, separando o que pode ser desenvolvido direto no código e o que exige ação manual no Supabase ou no ambiente.

## 1. Tarefas possíveis de fazer no VS Code (Copilot)

1. Refatorar o provedor de autenticação e dados (`lib/auth-context.tsx`):
   - Remover fallback de mocks (ou manter apenas em modo offline/teste).
   - Garantir carregamento consistente de `tutorials`, `requests` e `users` via Supabase.
   - Mapear corretamente `authorName` e `userName` a partir de `profiles`.
   - Tratar atualizações de salvamentos (`saved_tutorials`) com rollback de erro.
2. Revisar e padronizar tipos no `lib/types.ts`:
   - Consolidar tipos Supabase e tipos de UI.
   - Remover duplicidade de `initialTutorials`/`initialRequests` quando não necessário.
3. Implementar suporte a comentários persistentes:
   - Adicionar funções de CRUD de comentários no contexto.
   - Atualizar componentes de tutorial para exibir e deletar comentários.
4. Ajustar persistência de upvotes:
   - Garantir que `incrementTutorialUpvotes` atualize tanto o estado local quanto o banco.
   - Evitar atualização otimista sem rollback completo.
5. Implementar/ajustar operações de tutorial no admin:
   - `approveTutorial`, `deleteTutorial`, `banUser`, `promoteToAdmin`, etc.
6. Preencher páginas estáticas/sem conteúdo no `app/`:
   - `/sobre`, `/email-confirmado`, `/verifique-seu-email`, `/manutencao`, `/offline`, `/acesso-negado`.
7. Melhorar carregamento e tratamento de erros em `refreshData()`:
   - Separar carga de tutoriais, requisições e usuários para não falhar tudo de uma vez.
   - Registrar logs claros no console e avisos de toast.
8. Criar testes básicos de integração/local se houver infra para isso.

## 2. Tarefas que exigem ação manual do usuário

1. SQL e políticas do Supabase:
   - Executar correção de RLS em `profiles` para evitar erro `42P17`.
   - Definir policies de leitura e escrita para `tutorials`, `tutorial_requests`, `saved_tutorials`, `comments`, `upvotes`, `tutorial_problems`.
2. Criação/ajuste de tabelas no Supabase:
   - Criar `tutorials`, `tutorial_requests`, `comments`, `upvotes`, `tutorial_problems`, `saved_tutorials`.
   - Ajustar colunas e tipos de dados para suportar os relacionamentos usados no app.
3. Configuração de ambiente:
   - Confirmar valores de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local`.
   - Garantir que o Supabase esteja acessível a partir do app local.
4. Verificação pós-mudança:
   - Testar o aplicativo em `localhost:3000`.
   - Verificar se os tutoriais e requisições carregam sem `500`.
   - Testar criação e atualização de tutoriais e requisições.

## 3. Prioridade inicial

1. Corrigir RLS e validar o acesso a `profiles`.
2. Ajustar `lib/auth-context.tsx` para carregar `tutorials` e `requests` corretamente.
3. Confirmar que as páginas principais não retornam erro ao carregar.
4. Implementar CRUD mínimo de comentários e persistência de upvotes.
5. Preencher páginas básicas restantes.

## 4. Próximos passos técnicos

- [ ] Refatorar `refreshData()` para separar as chamadas ao Supabase.
- [ ] Criar um módulo de dados para operações de tutorial e requisição.
- [ ] Adicionar tratamento de erro específico para `42P17`.
- [ ] Remover dependência de `initialTutorials`/`initialRequests` quando possível.
- [ ] Registrar manualmente as pendências no arquivo `pendencias_manuais.txt`.
