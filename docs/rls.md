# RLS (Row Level Security) — Políticas essenciais

Este arquivo contém a documentação mínima e instruções básicas relacionadas às políticas RLS usadas no projeto.

Resumo rápido
- Propósito: aplicar regras de acesso por linha no banco Supabase (Postgres) para proteger dados sensíveis e garantir que usuários só acessem seus próprios registros.
- Onde aplicar: tabelas `profiles`, `tutorials`, `comments`, `tutorial_problems`, `tutorial_requests`.

Como aplicar
1. Conecte-se ao projeto Supabase ou ao banco Postgres com privilégios de administrador.
2. Execute os trechos SQL relevantes (ex.: criação de policies e roles). Este repositório removeu o script SQL bruto para manter o histórico limpo; mantenha um backup fora do repositório se necessário.

Exemplo (genérico):
```sql
-- Permitir leitura pública somente de tutoriais aprovados
CREATE POLICY "select_approved_tutorials" ON tutorials
  FOR SELECT USING (approved = true);

-- Permitir que o autor edite seu próprio tutorial
CREATE POLICY "update_own_tutorial" ON tutorials
  FOR UPDATE USING (auth.uid() = author_id);
```

Restaurar a partir de backup
- Se precisar reaplicar o script original (`fix-rls-policies.sql`), restaure a partir de seu backup seguro e execute no Supabase SQL Editor.

Observações
- O script SQL original foi convertido em documentação mínima para evitar versões sensíveis no histórico. Se você quiser que o arquivo `.sql` volte ao repositório (por ex., numa pasta `migrations/`), avise e eu reservo um local apropriado.

Assinatura
- Mantido: equipe do projeto
