-- Public, login-free legal questionnaire sessions.
-- Applied to the Cherelle Elisa Supabase project on 2026-11-21.

create table if not exists public.cherelle_legal_questionnaire_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token uuid not null unique,
  answers jsonb not null default '{}'::jsonb,
  current_question integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cherelle_legal_questionnaire_sessions_question_range
    check (current_question between 0 and 63)
);

alter table public.cherelle_legal_questionnaire_sessions enable row level security;

grant select, insert, update on public.cherelle_legal_questionnaire_sessions to anon;
grant select on public.cherelle_legal_questionnaire_sessions to authenticated;

drop policy if exists "Questionnaire session can insert own row"
on public.cherelle_legal_questionnaire_sessions;
create policy "Questionnaire session can insert own row"
on public.cherelle_legal_questionnaire_sessions
for insert to anon
with check (
  session_token::text =
    coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-questionnaire-token'),
      ''
    )
);

drop policy if exists "Questionnaire session can read own row"
on public.cherelle_legal_questionnaire_sessions;
create policy "Questionnaire session can read own row"
on public.cherelle_legal_questionnaire_sessions
for select to anon
using (
  session_token::text =
    coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-questionnaire-token'),
      ''
    )
);

drop policy if exists "Questionnaire session can update own row"
on public.cherelle_legal_questionnaire_sessions;
create policy "Questionnaire session can update own row"
on public.cherelle_legal_questionnaire_sessions
for update to anon
using (
  session_token::text =
    coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-questionnaire-token'),
      ''
    )
)
with check (
  session_token::text =
    coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-questionnaire-token'),
      ''
    )
);

drop policy if exists "Admins can read questionnaire sessions"
on public.cherelle_legal_questionnaire_sessions;
create policy "Admins can read questionnaire sessions"
on public.cherelle_legal_questionnaire_sessions
for select to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);
