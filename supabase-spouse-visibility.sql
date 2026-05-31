-- ═══════════════════════════════════════════════════
-- ENS DIA A DIA — Spouse Profile Visibility
-- Run this in Supabase SQL Editor.
-- Idempotent — safe to run multiple times.
-- ═══════════════════════════════════════════════════
--
-- Goal: let paired spouses see each other's display_name so the
-- "Casal conectado" screen can show "Rodrigo e Vivian" instead of
-- just an opaque email.
--
-- Privacy: this policy is narrow — only profiles that share your
-- couple_id are visible, and only when you yourself are paired.
-- Strangers, unpaired users, or other couples are NOT exposed.

drop policy if exists "Users can view spouse profile" on public.profiles;

create policy "Users can view spouse profile"
  on public.profiles for select
  using (
    couple_id is not null
    and id != auth.uid()
    and couple_id = (
      select couple_id
      from public.profiles
      where id = auth.uid()
      limit 1
    )
  );
