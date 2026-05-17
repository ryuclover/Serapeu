# SOLUÇÃO: Corrigir Erro 500 nas Tabelas Supabase

## Problema Identificado

Os endpoints da REST API do Supabase estão retornando erro **500** ao tentar ler os dados das tabelas `profiles` e `tutorials`. 

Isto é causado por **RLS (Row Level Security) policies recursivas** que causam erro `42P17` (infinite recursion).

## Como Resolver

Você tem 2 opções:

### OPÇÃO 1: Via Dashboard Supabase (Mais Fácil - 2 minutos)

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto **serapeu**
3. Vá para: **Project Settings** → **Database** → **Tables**

#### Para tabela "profiles":
- Clique em **profiles**
- Procure pela seção **Row Level Security (RLS)**
- Clique no toggle **Enable RLS** para DESATIVAR (toggle deve ficar em OFF)

#### Para tabela "tutorials":
- Clique em **tutorials**
- Procure pela seção **Row Level Security (RLS)**
- Clique no toggle **Enable RLS** para DESATIVAR (toggle deve ficar em OFF)

4. Aguarde a atualização
5. Recarregue a aplicação

### OPÇÃO 2: Via SQL Editor (Alternativa - 1 minuto)

1. Acesse: https://supabase.com/dashboard/project/ysszuvxejwdccgyexypq/sql
2. Cole o SQL abaixo no editor
3. Clique em **Run** (ou Ctrl+Enter)

```sql
-- Disable RLS on profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on tutorials
ALTER TABLE public.tutorials DISABLE ROW LEVEL SECURITY;
```

4. Recarregue a aplicação

## Resultado Esperado

✅ Admin panel deve mostrar tutorials e usuários  
✅ Sem mais erros 500 na REST API  
✅ Dados visíveis na aba "Tutoriais" e "Usuários"

## Próximas Etapas (Segurança)

Após resolver o problema, considere:
1. Implementar policies simples não-recursivas
2. Revisar RLS periodicamente para evitar recursão
3. Manter RLS desativado apenas se for um ambiente de desenvolvimento

## Debugging

Se ainda não funcionar:
- Verifique no browser DevTools (F12) → Console → Network
- Procure por requests para `https://ysszuvxejwdccgyexypq.supabase.co/rest/v1/tutorials`
- Deve retornar status 200 com array de dados
