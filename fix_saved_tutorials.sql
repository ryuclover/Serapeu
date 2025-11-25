-- Create saved_tutorials table if it doesn't exist
create table if not exists saved_tutorials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tutorial_id uuid references tutorials(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, tutorial_id)
);

-- Enable RLS
alter table saved_tutorials enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own saved tutorials" on saved_tutorials;
drop policy if exists "Users can save tutorials" on saved_tutorials;
drop policy if exists "Users can unsave tutorials" on saved_tutorials;

-- Create policies
create policy "Users can view their own saved tutorials"
  on saved_tutorials for select
  using (auth.uid() = user_id);

create policy "Users can save tutorials"
  on saved_tutorials for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave tutorials"
  on saved_tutorials for delete
  using (auth.uid() = user_id);
