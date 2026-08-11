-- ENS Dia a Dia - production database baseline.
--
-- This migration is intentionally idempotent because the production database
-- predates migration tracking. It both recreates a fresh project and reconciles
-- the existing project with the audited production access model.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
alter default privileges in schema private revoke execute on functions from public;

-- Core data model.
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  couple_id uuid references public.couples (id),
  spouse_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_data (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  data_key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  unique (couple_id, data_key)
);

create table if not exists public.user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  data_key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, data_key)
);

alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.couple_data enable row level security;
alter table public.user_data enable row level security;

create index if not exists profiles_couple_id_idx
  on public.profiles (couple_id);

create index if not exists couple_data_updated_by_idx
  on public.couple_data (updated_by);

-- Internal helper used by RLS. Keeping it outside public prevents it from
-- becoming a PostgREST RPC endpoint.
create or replace function private.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.couple_id
  from public.profiles as p
  where p.id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_couple_id() from public, anon, authenticated;
grant execute on function private.current_couple_id() to authenticated;

-- Replace every legacy policy with one explicit policy per operation.
drop policy if exists "Users can view couples" on public.couples;
drop policy if exists "Authenticated users can create couples" on public.couples;
drop policy if exists "Users can view own couple" on public.couples;
drop policy if exists "No direct couple inserts" on public.couples;
drop policy if exists "No couple deletes from client" on public.couples;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can view spouse profile" on public.profiles;
drop policy if exists "Users can view own or spouse profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "No profile deletes from client" on public.profiles;

drop policy if exists "Users can view own couple data" on public.couple_data;
drop policy if exists "Users can insert own couple data" on public.couple_data;
drop policy if exists "Users can update own couple data" on public.couple_data;
drop policy if exists "No couple_data deletes from client" on public.couple_data;

drop policy if exists "Users can view own user_data" on public.user_data;
drop policy if exists "Users can insert own user_data" on public.user_data;
drop policy if exists "Users can update own user_data" on public.user_data;
drop policy if exists "No user_data deletes from client" on public.user_data;

create policy "Users can view own couple"
  on public.couples
  for select
  to authenticated
  using (id = (select private.current_couple_id()));

create policy "Users can view own or spouse profile"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or (
      couple_id is not null
      and couple_id = (select private.current_couple_id())
    )
  );

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users can view own couple data"
  on public.couple_data
  for select
  to authenticated
  using (couple_id = (select private.current_couple_id()));

create policy "Users can insert own couple data"
  on public.couple_data
  for insert
  to authenticated
  with check (couple_id = (select private.current_couple_id()));

create policy "Users can update own couple data"
  on public.couple_data
  for update
  to authenticated
  using (couple_id = (select private.current_couple_id()))
  with check (couple_id = (select private.current_couple_id()));

create policy "Users can view own user_data"
  on public.user_data
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert own user_data"
  on public.user_data
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update own user_data"
  on public.user_data
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- The browser receives only the table/column privileges used by the app.
-- RLS remains the row-level authorization layer on top of these grants.
revoke all privileges on table public.couples from anon, authenticated;
revoke all privileges on table public.profiles from anon, authenticated;
revoke all privileges on table public.couple_data from anon, authenticated;
revoke all privileges on table public.user_data from anon, authenticated;

grant select on table public.couples to authenticated;

grant select on table public.profiles to authenticated;
grant insert (id, display_name, spouse_email) on table public.profiles to authenticated;
grant update (display_name, spouse_email) on table public.profiles to authenticated;

grant select on table public.couple_data to authenticated;
grant insert (couple_id, data_key, data) on table public.couple_data to authenticated;
grant update (couple_id, data_key, data) on table public.couple_data to authenticated;

grant select on table public.user_data to authenticated;
grant insert (user_id, data_key, data) on table public.user_data to authenticated;
grant update (user_id, data_key, data) on table public.user_data to authenticated;

-- Profiles are created by an Auth trigger. This privileged trigger function is
-- private and cannot be called directly through the Data API.
drop trigger if exists on_auth_user_created on auth.users;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Pairing is intentionally an authenticated RPC because it must read Auth
-- email addresses and update both profiles atomically despite RLS. It accepts
-- no user-supplied identifiers and derives the caller exclusively from JWT.
create or replace function public.check_and_pair()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_user_email text;
  v_my_profile public.profiles%rowtype;
  v_spouse_profile public.profiles%rowtype;
  v_spouse_id uuid;
  v_couple_id uuid;
begin
  if v_user_id is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  select u.email
    into v_user_email
  from auth.users as u
  where u.id = v_user_id;

  select p.*
    into v_my_profile
  from public.profiles as p
  where p.id = v_user_id;

  if v_user_email is null
     or v_my_profile is null
     or v_my_profile.couple_id is not null
     or nullif(btrim(v_my_profile.spouse_email), '') is null then
    return;
  end if;

  select p.id
    into v_spouse_id
  from public.profiles as p
  join auth.users as u on u.id = p.id
  where lower(u.email) = lower(v_my_profile.spouse_email)
    and p.id <> v_user_id
  limit 1;

  if v_spouse_id is null then
    return;
  end if;

  -- Serialize attempts for this exact pair, then lock both profile rows in a
  -- stable order before rechecking mutual consent.
  perform pg_advisory_xact_lock(
    hashtextextended(
      least(v_user_id::text, v_spouse_id::text)
      || ':' || greatest(v_user_id::text, v_spouse_id::text),
      0
    )
  );

  perform 1
  from public.profiles as p
  where p.id in (v_user_id, v_spouse_id)
  order by p.id
  for update;

  select p.* into v_my_profile
  from public.profiles as p
  where p.id = v_user_id;

  select p.* into v_spouse_profile
  from public.profiles as p
  where p.id = v_spouse_id;

  if v_my_profile.couple_id is not null
     or v_spouse_profile is null
     or v_spouse_profile.spouse_email is null
     or lower(v_spouse_profile.spouse_email) <> lower(v_user_email) then
    return;
  end if;

  if v_spouse_profile.couple_id is not null then
    if (
      select count(*)
      from public.profiles as p
      where p.couple_id = v_spouse_profile.couple_id
    ) < 2 then
      update public.profiles
      set couple_id = v_spouse_profile.couple_id
      where id = v_user_id;
    end if;
    return;
  end if;

  insert into public.couples default values
  returning id into v_couple_id;

  update public.profiles
  set couple_id = v_couple_id
  where id in (v_user_id, v_spouse_id);
end;
$$;

revoke all on function public.check_and_pair() from public, anon, authenticated;
grant execute on function public.check_and_pair() to authenticated;

-- Server-maintained audit timestamps. Couple writes also record the caller.
drop trigger if exists user_data_touch on public.user_data;
drop trigger if exists couple_data_touch on public.couple_data;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.touch_couple_data()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  new.updated_at := now();
  if v_user_id is not null then
    new.updated_by := v_user_id;
  end if;
  return new;
end;
$$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function private.touch_couple_data() from public, anon, authenticated;

create trigger user_data_touch
  before insert or update on public.user_data
  for each row execute function private.touch_updated_at();

create trigger couple_data_touch
  before insert or update on public.couple_data
  for each row execute function private.touch_couple_data();

-- Remove superseded public helpers only after their policies/triggers have
-- been replaced.
drop trigger if exists on_spouse_email_changed on public.profiles;
drop function if exists public.try_auto_pair();
drop function if exists public.handle_new_user();
drop function if exists public.my_couple_id();
drop function if exists public.touch_updated_at();

-- Realtime membership is also idempotent for the existing production project.
do $$
declare
  v_table text;
begin
  foreach v_table in array array['profiles', 'couple_data', 'user_data']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        v_table
      );
    end if;
  end loop;
end;
$$;
