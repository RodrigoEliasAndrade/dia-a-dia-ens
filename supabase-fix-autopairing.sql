-- ═══════════════════════════════════════════════════
-- FIX: Auto-pairing on signup + RPC fallback
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. RPC function: check_and_pair
-- Called by the frontend after login/signup when couple_id is NULL.
-- Checks if someone declared the current user's email as spouse → pairs them.
CREATE OR REPLACE FUNCTION public.check_and_pair()
RETURNS void AS $$
DECLARE
  v_user_email text;
  v_my_profile public.profiles%ROWTYPE;
  v_declarer public.profiles%ROWTYPE;
  v_couple_id uuid;
BEGIN
  -- Get current user's email
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  IF v_user_email IS NULL THEN RETURN; END IF;

  -- Get my profile
  SELECT * INTO v_my_profile FROM public.profiles WHERE id = auth.uid();
  IF v_my_profile IS NULL OR v_my_profile.couple_id IS NOT NULL THEN RETURN; END IF;

  -- Find someone who declared us as spouse
  SELECT p.* INTO v_declarer
  FROM public.profiles p
  WHERE lower(p.spouse_email) = lower(v_user_email)
    AND p.id != auth.uid()
  LIMIT 1;

  IF v_declarer IS NULL THEN RETURN; END IF;

  -- If declarer already has a couple, join it
  IF v_declarer.couple_id IS NOT NULL THEN
    IF (SELECT count(*) FROM public.profiles WHERE couple_id = v_declarer.couple_id) < 2 THEN
      UPDATE public.profiles SET couple_id = v_declarer.couple_id WHERE id = auth.uid();
    END IF;
    RETURN;
  END IF;

  -- Neither has a couple — create one and pair both
  INSERT INTO public.couples (invite_code) VALUES (NULL)
  RETURNING id INTO v_couple_id;

  UPDATE public.profiles SET couple_id = v_couple_id WHERE id = v_declarer.id;
  UPDATE public.profiles SET couple_id = v_couple_id WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Also fix handle_new_user to include pairing logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_declarer public.profiles%ROWTYPE;
  v_couple_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');

  -- Check if anyone declared this new user's email as their spouse
  SELECT p.* INTO v_declarer
  FROM public.profiles p
  WHERE lower(p.spouse_email) = lower(new.email)
    AND p.id != new.id
  LIMIT 1;

  IF v_declarer IS NOT NULL THEN
    IF v_declarer.couple_id IS NOT NULL THEN
      IF (SELECT count(*) FROM public.profiles WHERE couple_id = v_declarer.couple_id) < 2 THEN
        UPDATE public.profiles SET couple_id = v_declarer.couple_id WHERE id = new.id;
      END IF;
    ELSE
      INSERT INTO public.couples (invite_code) VALUES (NULL)
      RETURNING id INTO v_couple_id;
      UPDATE public.profiles SET couple_id = v_couple_id WHERE id = v_declarer.id;
      UPDATE public.profiles SET couple_id = v_couple_id WHERE id = new.id;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
