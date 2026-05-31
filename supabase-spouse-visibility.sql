-- ═══════════════════════════════════════════════════
-- ENS DIA A DIA — Spouse Profile Visibility (recursion-safe)
-- Run this in Supabase SQL Editor. Idempotent.
-- ═══════════════════════════════════════════════════
--
-- Goal: let paired spouses see each other's display_name.
--
-- IMPORTANT: a SELECT policy on `profiles` must NOT contain a subquery
-- against `profiles` itself, or Postgres throws "infinite recursion
-- detected in policy for relation profiles" and ALL profile reads fail.
--
-- Fix: read the caller's couple_id via a SECURITY DEFINER function, which
-- bypasses RLS and therefore cannot recurse.

-- 1. Drop the broken recursive policy if it exists
drop policy if exists "Users can view spouse profile" on public.profiles;

-- 2. Helper: returns the caller's couple_id without triggering RLS
create or replace function public.my_couple_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid() limit 1;
$$;

-- 3. Non-recursive policy using the helper
create policy "Users can view spouse profile"
  on public.profiles for select
  using (
    couple_id is not null
    and couple_id = public.my_couple_id()
  );
