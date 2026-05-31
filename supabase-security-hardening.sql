-- ═══════════════════════════════════════════════════
-- ENS DIA A DIA — Security Hardening Migration (idempotente)
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════

-- 1. Drop policies on couples that we're going to replace
drop policy if exists "Users can view couples" on public.couples;
drop policy if exists "Authenticated users can create couples" on public.couples;
drop policy if exists "Users can view own couple" on public.couples;
drop policy if exists "No direct couple inserts" on public.couples;
drop policy if exists "No couple deletes from client" on public.couples;

-- 1a. New SELECT policy: only see own couple
create policy "Users can view own couple"
  on public.couples for select
  using (
    id in (select couple_id from public.profiles where id = auth.uid())
  );

-- 1b. New INSERT policy: blocked entirely from client.
create policy "No direct couple inserts"
  on public.couples for insert
  with check (false);

-- 1c. Explicit DENY DELETE on couples
create policy "No couple deletes from client"
  on public.couples for delete
  using (false);

-- 2. DENY DELETE policies on profiles and couple_data
drop policy if exists "No profile deletes from client" on public.profiles;
create policy "No profile deletes from client"
  on public.profiles for delete
  using (false);

drop policy if exists "No couple_data deletes from client" on public.couple_data;
create policy "No couple_data deletes from client"
  on public.couple_data for delete
  using (false);

-- 3. Mutual-confirmation pairing for try_auto_pair
create or replace function public.try_auto_pair()
returns trigger as $$
declare
  v_spouse_profile public.profiles%rowtype;
  v_my_email text;
  v_couple_id uuid;
begin
  if NEW.spouse_email is null or NEW.spouse_email = '' then
    return NEW;
  end if;

  if NEW.couple_id is not null then
    return NEW;
  end if;

  select email into v_my_email from auth.users where id = NEW.id;
  if v_my_email is null then
    return NEW;
  end if;

  select p.* into v_spouse_profile
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(NEW.spouse_email)
    and p.id != NEW.id
  limit 1;

  if v_spouse_profile is null then
    return NEW;
  end if;

  -- MUTUAL CONFIRMATION
  if v_spouse_profile.spouse_email is null
     or lower(v_spouse_profile.spouse_email) != lower(v_my_email) then
    return NEW;
  end if;

  if v_spouse_profile.couple_id is not null then
    if (select count(*) from public.profiles where couple_id = v_spouse_profile.couple_id) < 2 then
      NEW.couple_id := v_spouse_profile.couple_id;
    end if;
    return NEW;
  end if;

  insert into public.couples (invite_code) values (null)
  returning id into v_couple_id;

  update public.profiles set couple_id = v_couple_id where id = v_spouse_profile.id;
  NEW.couple_id := v_couple_id;

  return NEW;
end;
$$ language plpgsql security definer;

-- 4. Replace handle_new_user — no longer auto-pairs on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_declarer public.profiles%rowtype;
  v_new_user_email text;
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');

  v_new_user_email := new.email;
  if v_new_user_email is null then
    return new;
  end if;

  select p.* into v_declarer
  from public.profiles p
  where lower(p.spouse_email) = lower(v_new_user_email)
    and p.id != new.id
  limit 1;

  if v_declarer is null then
    return new;
  end if;

  -- Pairing will happen later when the new user sets their spouse_email back.
  return new;
end;
$$ language plpgsql security definer;

-- 5. Per-user data table
create table if not exists public.user_data (
  user_id uuid references auth.users on delete cascade not null,
  data_key text not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (user_id, data_key)
);

alter table public.user_data enable row level security;

drop policy if exists "Users can view own user_data" on public.user_data;
create policy "Users can view own user_data"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own user_data" on public.user_data;
create policy "Users can insert own user_data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own user_data" on public.user_data;
create policy "Users can update own user_data"
  on public.user_data for update
  using (auth.uid() = user_id);

drop policy if exists "No user_data deletes from client" on public.user_data;
create policy "No user_data deletes from client"
  on public.user_data for delete
  using (false);

-- 6. updated_at trigger function
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch
  before update on public.user_data
  for each row execute function public.touch_updated_at();

drop trigger if exists couple_data_touch on public.couple_data;
create trigger couple_data_touch
  before update on public.couple_data
  for each row execute function public.touch_updated_at();

-- 7. Enable realtime on user_data (skip if already added)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_data'
  ) then
    alter publication supabase_realtime add table public.user_data;
  end if;
end $$;
