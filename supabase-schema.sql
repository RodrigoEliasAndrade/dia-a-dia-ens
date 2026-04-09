-- ═══════════════════════════════════════════════════
-- ENS DIA A DIA — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════

-- 1. COUPLES TABLE
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique default null,  -- legacy, kept for backward compat
  created_at timestamptz default now()
);

-- 2. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  couple_id uuid references public.couples(id),
  spouse_email text,  -- email-based pairing: stores declared spouse email
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

-- COUPLES: authenticated users can read/create
create policy "Users can view couples"
  on public.couples for select
  using (auth.uid() is not null);

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
-- AUTO-PAIR: Trigger when spouse_email is set/changed
-- ═══════════════════════════════════════════════════

create or replace function public.try_auto_pair()
returns trigger as $$
declare
  v_spouse_profile public.profiles%rowtype;
  v_couple_id uuid;
begin
  if NEW.spouse_email is null or NEW.spouse_email = '' then
    return NEW;
  end if;

  if NEW.couple_id is not null then
    return NEW;
  end if;

  -- Find spouse by email
  select p.* into v_spouse_profile
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(NEW.spouse_email)
    and p.id != NEW.id
  limit 1;

  if v_spouse_profile is null then
    return NEW;  -- spouse hasn't signed up yet
  end if;

  if v_spouse_profile.couple_id is not null then
    -- Join spouse's existing couple if room
    if (select count(*) from public.profiles where couple_id = v_spouse_profile.couple_id) < 2 then
      NEW.couple_id := v_spouse_profile.couple_id;
    end if;
    return NEW;
  end if;

  -- Neither has a couple — create one
  insert into public.couples (invite_code) values (null)
  returning id into v_couple_id;

  update public.profiles set couple_id = v_couple_id where id = v_spouse_profile.id;
  NEW.couple_id := v_couple_id;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_spouse_email_changed on public.profiles;
create trigger on_spouse_email_changed
  before update on public.profiles
  for each row
  when (NEW.spouse_email is distinct from OLD.spouse_email)
  execute function public.try_auto_pair();

-- ═══════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP + AUTO-PAIR
-- ═══════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_declarer public.profiles%rowtype;
  v_couple_id uuid;
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');

  -- Check if anyone declared this new user as their spouse
  select p.* into v_declarer
  from public.profiles p
  where lower(p.spouse_email) = lower(new.email)
    and p.id != new.id
  limit 1;

  if v_declarer is not null then
    if v_declarer.couple_id is not null then
      if (select count(*) from public.profiles where couple_id = v_declarer.couple_id) < 2 then
        update public.profiles set couple_id = v_declarer.couple_id where id = new.id;
      end if;
    else
      insert into public.couples (invite_code) values (null)
      returning id into v_couple_id;
      update public.profiles set couple_id = v_couple_id where id = v_declarer.id;
      update public.profiles set couple_id = v_couple_id where id = new.id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════
-- ENABLE REALTIME
-- ═══════════════════════════════════════════════════

alter publication supabase_realtime add table public.couple_data;
alter publication supabase_realtime add table public.profiles;
