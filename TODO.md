# 📋 TODO — Serapeu Development Roadmap

> **Branch ativa:** feature/Glados
> **Atualizado:** 10/04/2026
> **Status geral:** MVP 60% completo
> Priorizado por impacto técnico e dependências diretas

---

## 🚧 Visão Geral

A principal prioridade é estabilizar a camada de dados Supabase e remover dependências de mock data em produção. Em seguida vem o CRUD administrativo, depois as funcionalidades de engajamento e, por fim, os recursos de polimento.

---

## 🔴 CRÍTICO — Core Data & Supabase

Essas tarefas são blockers para o app funcionar corretamente em produção.

- [ ] **1. Corrigir RLS e integração com `profiles`**
  - Ajustar políticas RLS para `profiles`
  - Garantir que `tutorials` e `tutorial_requests` possam buscar `profiles(name)` sem erro 42P17
  - Remover fallback de dados de mock quando o banco falhar

- [ ] **2. Migrar tutoriais para Supabase**
  - Parar de depender de `initialTutorials`
  - Garantir leitura e escrita em `tutorials`
  - Mapear `authorName` a partir de `profiles` ou session metadata
  - Suportar `approved`, `upvotes`, `steps`, `category`

- [ ] **3. Migrar requisições para Supabase**
  - Substituir `initialRequests` por `tutorial_requests`
  - Persistir `upvoted_by`, `answered`, `answered_tutorial_id`
  - Remover fallback de mock em produção

- [ ] **4. Persistir comentários em Supabase**
  - Criar tabela `comments`
  - Implementar comentário por tutorial
  - Listar comentários no template de tutorial
  - Permitir exclusão por autor e admin

- [ ] **5. Persistir problemas em Supabase**
  - Criar tabela `tutorial_problems`
  - Salvar relatórios de problema do tutorial
  - Exibir lista de problemas no admin
  - Permitir marcar como resolvido

- [ ] **6. Persistir votos e salvamentos por usuário**
  - Garantir que upvotes sejam únicos por usuário+tutorial
  - Criar tabela `saved_tutorials`
  - Sincronizar `user.savedTutorials`
  - Evitar uso de estados locais como fonte de verdade

---

## 🟠 ALTO — Admin e Fluxos Essenciais

Após o core estar estável, essas features tornam o app gerenciável.

- [ ] **7. CRUD completo no admin**
  - Aprovar tutorial
  - Excluir tutorial
  - Excluir requisição
  - Banir/desbanir usuário
  - Promover/demover admin
  - Registrar ações em logs de administrador

- [ ] **8. Melhorar criação de tutorial**
  - Validar formulário com Zod e react-hook-form
  - Garantir título, descrição e passos válidos
  - Feedback de erro claro para o usuário
  - Manter bom UX em mobile e dark mode

- [ ] **9. Ajustar perfil e sessão**
  - Carregar `user.role` e `savedTutorials` direto do Supabase
  - Remover dados de usuário mock em produção
  - Garantir que o usuário veja seu conteúdo e permissões reais

- [ ] **10. Rota de perfil público**
  - Criar `/usuario/[id]`
  - Mostrar tutoriais do usuário
  - Exibir estatísticas básicas
  - Link para compartilhar perfil

---

## 🟡 MÉDIO — Engajamento e Busca

Essas tarefas melhoram experiência e descoberta, mas não bloqueiam o core.

- [ ] **11. Implementar tags para tutoriais**
  - Criar tabelas `tags` e `tutorial_tags`
  - UI para adicionar e filtrar tags
  - Permitir filtro por tag na home

- [ ] **12. Busca avançada**
  - Pesquisar por título, descrição e categoria
  - Filtrar por tags, autor e data
  - Ordenar por `upvotes`, recência e relevância

- [ ] **13. Sistema de notificações**
  - Toasts para ações de usuário importantes
  - Notificação de novo comentário em tutorial criado
  - Notificação de tutorial aprovado/rejeitado
  - Possível integração com Supabase Realtime ou email

---

## 🟢 BAIXO — Extras e Polimento

Recursos úteis, mas não críticos para o MVP.

- [ ] **14. Upload de imagens**
  - Integrar Supabase Storage para thumbnails
  - Validar tamanho e tipos de arquivo
  - Exibir imagens nos cards e tutoriais

- [ ] **15. Testes automatizados**
  - Configurar Jest + React Testing Library
  - Cobrir componentes críticos como cards, forms e contexto
  - Alcançar cobertura mínima de 60%

- [ ] **16. SEO e metatags dinâmicas**
  - Definir título e descrição por página
  - Suportar `og:image`, `og:title` e `og:description`
  - Gerar `sitemap.xml` e `robots.txt`

---

## 📌 Ordem Recomendada de Trabalho

1. Corrigir RLS de `profiles` e garantir acesso a `profiles(name)`
2. Migrar `tutorials` para Supabase
3. Migrar `tutorial_requests` para Supabase
4. Implementar `comments` e `tutorial_problems`
5. Persistir upvotes e salvamentos
6. Completar CRUD admin e logs
7. Melhorar criação de tutorial e validação
8. Implementar perfil público
9. Desenvolver tags e busca avançada
10. Adicionar notificações, upload de imagens, testes e SEO

---

## 🔧 Notas Técnicas

- Manter todos os arquivos em **TypeScript** sem `any`
- Tipar consultas Supabase explicitamente
- Usar `react-hook-form` + `zod` para validação de formulários
- Evitar falhas silenciosas: mostrar toasts em erros de rede
- Preferir dados server-driven sempre que possível

---

## 📄 Problemas Manuais

- Se não for possível corrigir a política RLS de `profiles` localmente, documentar no `pendencias_manuais.txt`.
- Se houver inconsistência no schema Supabase, guardar as queries SQL necessárias em `pendencias_manuais.txt`.

---

**Última atualização:** 10/04/2026
**Próxima revisão:** após completar a etapa 5

