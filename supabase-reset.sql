-- Serapeu Supabase reset script
-- Execute este arquivo no SQL Editor de um projeto novo do Supabase.

create extension if not exists "pgcrypto";

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  banned boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;

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

-- UPDATED_AT TRIGGER
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- AUTO PROFILE CREATION
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, banned)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'USER'),
    false
  )
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name,
      role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- TUTORIALS
create table if not exists public.tutorials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  steps jsonb not null default '[]'::jsonb,
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  approved boolean not null default false,
  upvotes integer not null default 0
);

alter table public.tutorials enable row level security;

drop policy if exists "Tutorials are viewable by everyone" on public.tutorials;
drop policy if exists "Authenticated users can create tutorials" on public.tutorials;
drop policy if exists "Authors can update their tutorials" on public.tutorials;
drop policy if exists "Admins can manage tutorials" on public.tutorials;

create policy "Tutorials are viewable by everyone"
  on public.tutorials for select
  using (approved = true or author_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  ));

create policy "Authenticated users can create tutorials"
  on public.tutorials for insert
  with check (auth.uid() = author_id);

create policy "Authors can update their tutorials"
  on public.tutorials for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Admins can manage tutorials"
  on public.tutorials for all
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  );

drop trigger if exists set_tutorials_updated_at on public.tutorials;
create trigger set_tutorials_updated_at
before update on public.tutorials
for each row
execute function public.set_updated_at();

-- TUTORIAL REQUESTS
create table if not exists public.tutorial_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  upvotes integer not null default 0,
  upvoted_by uuid[] not null default '{}',
  answered boolean not null default false,
  answered_tutorial_id uuid null references public.tutorials(id) on delete set null
);

alter table public.tutorial_requests enable row level security;

drop policy if exists "Requests are viewable by everyone" on public.tutorial_requests;
drop policy if exists "Users can create requests" on public.tutorial_requests;
drop policy if exists "Users can update their own requests" on public.tutorial_requests;
drop policy if exists "Admins can manage requests" on public.tutorial_requests;

create policy "Requests are viewable by everyone"
  on public.tutorial_requests for select
  using (true);

create policy "Users can create requests"
  on public.tutorial_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own requests"
  on public.tutorial_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage requests"
  on public.tutorial_requests for all
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  );

drop trigger if exists set_tutorial_requests_updated_at on public.tutorial_requests;
create trigger set_tutorial_requests_updated_at
before update on public.tutorial_requests
for each row
execute function public.set_updated_at();

-- SAVED TUTORIALS
create table if not exists public.saved_tutorials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tutorial_id uuid references public.tutorials(id) on delete cascade not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, tutorial_id)
);

alter table public.saved_tutorials enable row level security;

drop policy if exists "Users can view their own saved tutorials" on public.saved_tutorials;
drop policy if exists "Users can save tutorials" on public.saved_tutorials;
drop policy if exists "Users can unsave tutorials" on public.saved_tutorials;

create policy "Users can view their own saved tutorials"
  on public.saved_tutorials for select
  using (auth.uid() = user_id);

create policy "Users can save tutorials"
  on public.saved_tutorials for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave tutorials"
  on public.saved_tutorials for delete
  using (auth.uid() = user_id);

-- COMMENTS
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  tutorial_id uuid not null references public.tutorials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  content text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.comments enable row level security;

drop policy if exists "Users can view comments" on public.comments;
drop policy if exists "Users can insert comments" on public.comments;
drop policy if exists "Users can delete their comments" on public.comments;
drop policy if exists "Admins can manage comments" on public.comments;

create policy "Users can view comments"
  on public.comments for select
  using (true);

create policy "Users can insert comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their comments"
  on public.comments for delete
  using (auth.uid() = user_id);

create policy "Admins can manage comments"
  on public.comments for all
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  );

-- PROBLEM REPORTS
create table if not exists public.tutorial_problems (
  id uuid default gen_random_uuid() primary key,
  tutorial_id uuid not null references public.tutorials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  step_number integer null,
  description text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.tutorial_problems enable row level security;

drop policy if exists "Users can view problems" on public.tutorial_problems;
drop policy if exists "Users can insert problems" on public.tutorial_problems;
drop policy if exists "Users can update their problems" on public.tutorial_problems;
drop policy if exists "Admins can manage problems" on public.tutorial_problems;

create policy "Users can view problems"
  on public.tutorial_problems for select
  using (true);

create policy "Users can insert problems"
  on public.tutorial_problems for insert
  with check (auth.uid() = user_id);

create policy "Users can update their problems"
  on public.tutorial_problems for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage problems"
  on public.tutorial_problems for all
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
    )
  );

-- TUTORIAL VOTES
create table if not exists public.tutorial_votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  tutorial_id uuid not null references public.tutorials(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, tutorial_id)
);

alter table public.tutorial_votes enable row level security;

drop policy if exists "Users can view their own tutorial votes" on public.tutorial_votes;
drop policy if exists "Users can vote tutorials" on public.tutorial_votes;
drop policy if exists "Users can unvote tutorials" on public.tutorial_votes;

create policy "Users can view their own tutorial votes"
  on public.tutorial_votes for select
  using (auth.uid() = user_id);

create policy "Users can vote tutorials"
  on public.tutorial_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can unvote tutorials"
  on public.tutorial_votes for delete
  using (auth.uid() = user_id);

-- INDEXES
create index if not exists tutorials_author_id_idx on public.tutorials(author_id);
create index if not exists tutorials_approved_idx on public.tutorials(approved);
create index if not exists tutorials_category_idx on public.tutorials(category);
create index if not exists tutorial_requests_user_id_idx on public.tutorial_requests(user_id);
create index if not exists saved_tutorials_user_id_idx on public.saved_tutorials(user_id);
create index if not exists saved_tutorials_tutorial_id_idx on public.saved_tutorials(tutorial_id);
create index if not exists tutorial_votes_user_id_idx on public.tutorial_votes(user_id);
create index if not exists tutorial_votes_tutorial_id_idx on public.tutorial_votes(tutorial_id);
