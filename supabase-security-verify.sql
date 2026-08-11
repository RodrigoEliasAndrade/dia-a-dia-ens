-- ENS Dia a Dia - production security verification.
-- Run after the latest file in supabase/migrations/.
-- Expected result: every row has status = 'ok'.

with checks (check_type, item, ok) as (
  -- All Data API tables must be protected by RLS.
  select
    'rls',
    c.relname,
    c.relrowsecurity
  from pg_class as c
  join pg_namespace as n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('couples', 'profiles', 'couple_data', 'user_data')

  union all

  -- Policies are explicit for authenticated users, never PUBLIC/anon.
  select
    'policy_role',
    p.tablename || ': ' || p.policyname,
    p.roles = array['authenticated']::name[]
  from pg_policies as p
  where p.schemaname = 'public'
    and p.tablename in ('couples', 'profiles', 'couple_data', 'user_data')

  union all

  -- The anonymous role has no direct access to private user data.
  select
    'anon_privileges',
    v.table_name,
    not has_table_privilege(
      'anon',
      format('public.%I', v.table_name),
      'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'
    )
  from (
    values ('couples'), ('profiles'), ('couple_data'), ('user_data')
  ) as v (table_name)

  union all

  -- A user cannot assign couple_id directly; pairing owns that field.
  select
    'column_privileges',
    'profiles.couple_id cannot be updated by authenticated',
    not has_column_privilege(
      'authenticated', 'public.profiles', 'couple_id', 'UPDATE'
    )

  union all

  select
    'column_privileges',
    'profiles.spouse_email can be updated by authenticated',
    has_column_privilege(
      'authenticated', 'public.profiles', 'spouse_email', 'UPDATE'
    )

  union all

  -- Only the required RPC is exposed, and only to authenticated users.
  select
    'rpc_privileges',
    'anon cannot execute public.check_and_pair',
    not has_function_privilege('anon', 'public.check_and_pair()', 'EXECUTE')

  union all

  select
    'rpc_privileges',
    'authenticated can execute public.check_and_pair',
    has_function_privilege('authenticated', 'public.check_and_pair()', 'EXECUTE')

  union all

  -- Superseded privileged public helpers must not exist as RPC endpoints.
  select
    'public_function',
    v.function_name || ' is not exposed',
    to_regprocedure('public.' || v.function_name || '()') is null
  from (
    values
      ('try_auto_pair'),
      ('handle_new_user'),
      ('my_couple_id'),
      ('touch_updated_at')
  ) as v (function_name)

  union all

  -- Advisor-requested covering indexes.
  select
    'index',
    v.index_name,
    to_regclass('public.' || v.index_name) is not null
  from (
    values ('profiles_couple_id_idx'), ('couple_data_updated_by_idx')
  ) as v (index_name)

  union all

  -- All synchronized tables remain in the Realtime publication.
  select
    'realtime',
    v.table_name,
    exists (
      select 1
      from pg_publication_tables as pt
      where pt.pubname = 'supabase_realtime'
        and pt.schemaname = 'public'
        and pt.tablename = v.table_name
    )
  from (
    values ('profiles'), ('couple_data'), ('user_data')
  ) as v (table_name)
)
select
  check_type,
  item,
  case when ok then 'ok' else 'review' end as status
from checks
order by check_type, item;
