# Supabase Fix — Policy Recursion em profiles

## Diagnóstico

O app está corretamente conectado ao Supabase, mas as queries de carregamento de dados falham com erro:

- `code: 42P17`
- `message: infinite recursion detected in policy for relation "profiles"`

Isso indica que a tabela `public.profiles` tem uma policy de Row Level Security que consulta a própria tabela de forma recursiva.

## O que fazer

No SQL Editor do Supabase, execute este script exatamente:

```sql
begin;

drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

commit;
```

## Resultado esperado

- O app deve parar de retornar 500 nas queries de `tutorials`, `tutorial_requests` e `profiles`.
- A página inicial deve voltar a carregar sem falha de recurso.

## Validação

1. Recarregue `http://localhost:3000/`.
2. Verifique se o console do navegador não mostra mais 500 para requests do app.
3. Crie um tutorial de teste em `/criar`.
4. Confirme se ele aparece em `tutorials` no Supabase e na UI.
