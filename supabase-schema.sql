-- ═══════════════════════════════════════════════════
-- ENS DIA A DIA — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════

-- 1. COUPLES TABLE
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_at timestamptz default now()
);

-- 2. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  couple_id uuid references public.couples(id),
  created_at timestamptz default now()
);

-- 3. COUPLE DATA TABLE (shared data between spouses)
create table if not exists public.couple_data (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples(id) on delete cascade not null,
  data_key text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  updated_by uuid references auth.users,
  unique(couple_id, data_key)
);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.couple_data enable row level security;

-- PROFILES: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- COUPLES: users can read their own couple + lookup by invite code
create policy "Users can view own couple"
  on public.couples for select
  using (
    id in (select couple_id from public.profiles where id = auth.uid())
    or true  -- allow reading any couple (needed for invite code lookup)
  );

create policy "Authenticated users can create couples"
  on public.couples for insert
  with check (auth.uid() is not null);

-- COUPLE DATA: users can read/write data for their own couple
create policy "Users can view own couple data"
  on public.couple_data for select
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );

create policy "Users can insert own couple data"
  on public.couple_data for insert
  with check (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own couple data"
  on public.couple_data for update
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );

-- ═══════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════
-- ENABLE REALTIME
-- ═══════════════════════════════════════════════════

alter publication supabase_realtime add table public.couple_data;
