-- ═══════════════════════════════════════════════════
-- MIGRATION: Email-Based Couple Pairing
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Safe to run multiple times (idempotent)
-- ═══════════════════════════════════════════════════

-- ─── Step 1: Add spouse_email column to profiles ───
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS spouse_email text;

-- ─── Step 2: Make invite_code optional (backward compat) ───
ALTER TABLE public.couples
  ALTER COLUMN invite_code DROP NOT NULL;

ALTER TABLE public.couples
  ALTER COLUMN invite_code SET DEFAULT NULL;

-- ─── Step 3: Auto-pair trigger on spouse_email change ───
CREATE OR REPLACE FUNCTION public.try_auto_pair()
RETURNS trigger AS $$
DECLARE
  v_spouse_profile public.profiles%ROWTYPE;
  v_spouse_email_of_user text;
  v_couple_id uuid;
BEGIN
  -- Only run if spouse_email was set/changed and user has no couple yet
  IF NEW.spouse_email IS NULL OR NEW.spouse_email = '' THEN
    RETURN NEW;
  END IF;

  -- If already paired, just save the email change
  IF NEW.couple_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Find spouse: a profile whose auth email matches NEW.spouse_email
  SELECT p.* INTO v_spouse_profile
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(u.email) = lower(NEW.spouse_email)
    AND p.id != NEW.id
  LIMIT 1;

  -- No spouse account yet? Save email, pairing will happen when they sign up
  IF v_spouse_profile IS NULL THEN
    RETURN NEW;
  END IF;

  -- Spouse already in a couple? Join that couple (if it has room)
  IF v_spouse_profile.couple_id IS NOT NULL THEN
    IF (SELECT count(*) FROM public.profiles WHERE couple_id = v_spouse_profile.couple_id) < 2 THEN
      NEW.couple_id := v_spouse_profile.couple_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Neither has a couple — create one
  INSERT INTO public.couples (invite_code) VALUES (NULL)
  RETURNING id INTO v_couple_id;

  -- Assign couple to spouse
  UPDATE public.profiles SET couple_id = v_couple_id WHERE id = v_spouse_profile.id;

  -- Assign couple to current user (via NEW, since this is BEFORE trigger)
  NEW.couple_id := v_couple_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_spouse_email_changed ON public.profiles;
CREATE TRIGGER on_spouse_email_changed
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.spouse_email IS DISTINCT FROM OLD.spouse_email)
  EXECUTE FUNCTION public.try_auto_pair();

-- ─── Step 4: Update handle_new_user to auto-pair on signup ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_declarer public.profiles%ROWTYPE;
  v_couple_id uuid;
BEGIN
  -- Create profile as before
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');

  -- Check if anyone has declared this new user's email as their spouse
  SELECT p.* INTO v_declarer
  FROM public.profiles p
  WHERE lower(p.spouse_email) = lower(new.email)
    AND p.id != new.id
  LIMIT 1;

  IF v_declarer IS NOT NULL THEN
    IF v_declarer.couple_id IS NOT NULL THEN
      -- Declarer already has a couple, join it if there's room
      IF (SELECT count(*) FROM public.profiles WHERE couple_id = v_declarer.couple_id) < 2 THEN
        UPDATE public.profiles SET couple_id = v_declarer.couple_id WHERE id = new.id;
      END IF;
    ELSE
      -- Create couple for both
      INSERT INTO public.couples (invite_code) VALUES (NULL)
      RETURNING id INTO v_couple_id;
      UPDATE public.profiles SET couple_id = v_couple_id WHERE id = v_declarer.id;
      UPDATE public.profiles SET couple_id = v_couple_id WHERE id = new.id;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (uses updated function automatically since it's CREATE OR REPLACE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Step 5: Enable realtime on profiles (for live pairing updates) ───
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ─── Done! ───
-- Existing couples are unaffected (couple_id already set).
-- New couples will auto-pair via spouse_email.
