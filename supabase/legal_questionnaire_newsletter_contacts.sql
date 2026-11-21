-- Legal questionnaire + newsletter audience preferences.
-- Applied to the Cherelle Elisa Supabase project on 2026-11-21.

create table if not exists public.cherelle_legal_questionnaire (
  id text primary key default 'main',
  answers jsonb not null default '{}'::jsonb,
  current_step integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cherelle_legal_questionnaire_singleton check (id = 'main'),
  constraint cherelle_legal_questionnaire_step_range check (current_step between 0 and 9)
);

alter table public.cherelle_legal_questionnaire enable row level security;
grant select, insert, update on public.cherelle_legal_questionnaire to authenticated;
revoke all on public.cherelle_legal_questionnaire from anon;

drop policy if exists "Admins can read legal questionnaire" on public.cherelle_legal_questionnaire;
create policy "Admins can read legal questionnaire"
on public.cherelle_legal_questionnaire
for select to authenticated
using (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can insert legal questionnaire" on public.cherelle_legal_questionnaire;
create policy "Admins can insert legal questionnaire"
on public.cherelle_legal_questionnaire
for insert to authenticated
with check (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can update legal questionnaire" on public.cherelle_legal_questionnaire;
create policy "Admins can update legal questionnaire"
on public.cherelle_legal_questionnaire
for update to authenticated
using (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

insert into public.cherelle_legal_questionnaire (id, answers, current_step)
values (
  'main',
  jsonb_build_object(
    'q7_technology',
    'Vercel (hosting en deployment), Supabase (database, authenticatie, opslag en eigen first-party bezoekersstatistieken), Resend (transactionele e-mail en nieuwsbrief). De website gebruikt daarnaast browseropslag zoals localStorage/sessionStorage voor sessies, taalvoorkeur en de eigen first-party analytics.',
    'q9_newsletter_policy',
    'Mensen kunnen zich los inschrijven voor de nieuwsbrief en zich ook weer uitschrijven. De nieuwsbrief wordt verstuurd naar klanten en losse inschrijvers. Een klant ontvangt de nieuwsbrief totdat die klant zich afmeldt.'
  ),
  0
)
on conflict (id) do update
set answers = public.cherelle_legal_questionnaire.answers
  || jsonb_build_object(
    'q7_technology',
    'Vercel (hosting en deployment), Supabase (database, authenticatie, opslag en eigen first-party bezoekersstatistieken), Resend (transactionele e-mail en nieuwsbrief). De website gebruikt daarnaast browseropslag zoals localStorage/sessionStorage voor sessies, taalvoorkeur en de eigen first-party analytics.',
    'q9_newsletter_policy',
    'Mensen kunnen zich los inschrijven voor de nieuwsbrief en zich ook weer uitschrijven. De nieuwsbrief wordt verstuurd naar klanten en losse inschrijvers. Een klant ontvangt de nieuwsbrief totdat die klant zich afmeldt.'
  ),
  updated_at = now();

create table if not exists public.cherelle_newsletter_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  kind text not null default 'subscriber',
  client_id uuid references public.cherelle_clients(id) on delete cascade,
  status text not null default 'subscribed',
  source text not null default 'website',
  consent_text text,
  unsubscribe_token uuid not null default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cherelle_newsletter_contacts_kind check (kind in ('subscriber','client')),
  constraint cherelle_newsletter_contacts_status check (status in ('subscribed','unsubscribed')),
  constraint cherelle_newsletter_contacts_email_length check (char_length(email) between 3 and 320)
);

create unique index if not exists cherelle_newsletter_active_subscriber_email_unique
on public.cherelle_newsletter_contacts ((lower(email)))
where kind = 'subscriber' and status = 'subscribed';

create unique index if not exists cherelle_newsletter_client_unique
on public.cherelle_newsletter_contacts (client_id)
where kind = 'client' and client_id is not null;

alter table public.cherelle_newsletter_contacts enable row level security;
grant select, insert, update on public.cherelle_newsletter_contacts to authenticated;
grant select, insert, update on public.cherelle_newsletter_contacts to anon;

drop policy if exists "Admins can read newsletter contacts" on public.cherelle_newsletter_contacts;
create policy "Admins can read newsletter contacts"
on public.cherelle_newsletter_contacts
for select to authenticated
using (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can insert newsletter contacts" on public.cherelle_newsletter_contacts;
create policy "Admins can insert newsletter contacts"
on public.cherelle_newsletter_contacts
for insert to authenticated
with check (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can update newsletter contacts" on public.cherelle_newsletter_contacts;
create policy "Admins can update newsletter contacts"
on public.cherelle_newsletter_contacts
for update to authenticated
using (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Website can add newsletter subscribers" on public.cherelle_newsletter_contacts;
create policy "Website can add newsletter subscribers"
on public.cherelle_newsletter_contacts
for insert to anon
with check (
  kind = 'subscriber'
  and source = 'website'
  and status = 'subscribed'
  and client_id is null
  and consent_text is not null
  and char_length(consent_text) > 0
);

drop policy if exists "Unsubscribe token can read newsletter contact" on public.cherelle_newsletter_contacts;
create policy "Unsubscribe token can read newsletter contact"
on public.cherelle_newsletter_contacts
for select to anon
using (
  unsubscribe_token::text =
    coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-unsubscribe-token'),
      ''
    )
);

drop policy if exists "Unsubscribe token can update newsletter contact" on public.cherelle_newsletter_contacts;
create policy "Unsubscribe token can update newsletter contact"
on public.cherelle_newsletter_contacts
for update to anon
using (
  unsubscribe_token::text =
    coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-unsubscribe-token'),
      ''
    )
)
with check (
  unsubscribe_token::text =
    coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-unsubscribe-token'),
      ''
    )
  and status in ('subscribed','unsubscribed')
);
