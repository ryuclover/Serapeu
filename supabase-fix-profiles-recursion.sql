-- Fix de recursao RLS em public.profiles (erro 42P17)

begin;

drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  );
$$;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = 'USER'
    and banned = false
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (public.is_admin_user());

commit;
