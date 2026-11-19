-- Dashboard analytics, client messages, activity and newsletters.
-- Applied to the Cherelle Elisa Supabase project.

create table if not exists public.cherelle_page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  referrer text,
  created_at timestamptz not null default now(),
  check (char_length(session_id) between 8 and 100),
  check (char_length(path) between 1 and 300)
);

create index if not exists cherelle_page_views_created_at_idx
  on public.cherelle_page_views (created_at desc);
create index if not exists cherelle_page_views_session_idx
  on public.cherelle_page_views (session_id, created_at desc);

alter table public.cherelle_page_views enable row level security;
revoke all on public.cherelle_page_views from anon, authenticated;
grant insert on public.cherelle_page_views to anon, authenticated;
grant select on public.cherelle_page_views to authenticated;

drop policy if exists "Public can record anonymous page views" on public.cherelle_page_views;
create policy "Public can record anonymous page views"
on public.cherelle_page_views
for insert
to anon, authenticated
with check (
  char_length(session_id) between 8 and 100
  and path like '/%'
  and char_length(path) <= 300
);

drop policy if exists "Admins can read page views" on public.cherelle_page_views;
create policy "Admins can read page views"
on public.cherelle_page_views
for select
to authenticated
using (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

create table if not exists public.cherelle_client_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.cherelle_clients(id) on delete cascade,
  subject text not null,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists cherelle_client_messages_client_idx
  on public.cherelle_client_messages (client_id, created_at desc);

alter table public.cherelle_client_messages enable row level security;
revoke all on public.cherelle_client_messages from anon, authenticated;
grant select, insert on public.cherelle_client_messages to authenticated;
grant update (read_at) on public.cherelle_client_messages to authenticated;

drop policy if exists "Clients and admins can read messages" on public.cherelle_client_messages;
create policy "Clients and admins can read messages"
on public.cherelle_client_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.cherelle_clients c
    where c.id = client_id
      and (
        c.user_id = (select auth.uid())
        or exists (
          select 1 from public.cherelle_admins a
          where a.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "Admins can send client messages" on public.cherelle_client_messages;
create policy "Admins can send client messages"
on public.cherelle_client_messages
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Clients can mark own messages read" on public.cherelle_client_messages;
create policy "Clients can mark own messages read"
on public.cherelle_client_messages
for update
to authenticated
using (
  exists (
    select 1 from public.cherelle_clients c
    where c.id = client_id and c.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.cherelle_clients c
    where c.id = client_id and c.user_id = (select auth.uid())
  )
);

create table if not exists public.cherelle_admin_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.cherelle_clients(id) on delete cascade,
  event_type text not null check (event_type in ('account_activated','intake_submitted')),
  title text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists cherelle_admin_events_created_idx
  on public.cherelle_admin_events (created_at desc);

alter table public.cherelle_admin_events enable row level security;
revoke all on public.cherelle_admin_events from anon, authenticated;
grant select on public.cherelle_admin_events to authenticated;
grant update (read_at) on public.cherelle_admin_events to authenticated;

drop policy if exists "Admins can read client activity" on public.cherelle_admin_events;
create policy "Admins can read client activity"
on public.cherelle_admin_events
for select
to authenticated
using (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can mark client activity read" on public.cherelle_admin_events;
create policy "Admins can mark client activity read"
on public.cherelle_admin_events
for update
to authenticated
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

create or replace function public.cherelle_event_account_activated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.activated_at is not null and old.activated_at is null then
    insert into public.cherelle_admin_events (client_id, event_type, title)
    values (new.id, 'account_activated', new.name || ' heeft haar account geactiveerd');
  end if;
  return new;
end;
$$;

drop trigger if exists cherelle_client_activation_event on public.cherelle_clients;
create trigger cherelle_client_activation_event
after update of activated_at on public.cherelle_clients
for each row
execute function public.cherelle_event_account_activated();

create or replace function public.cherelle_event_intake_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  client_name text;
begin
  if new.submitted_at is not null
     and (tg_op = 'INSERT' or old.submitted_at is distinct from new.submitted_at) then
    select name into client_name
    from public.cherelle_clients
    where id = new.client_id;

    insert into public.cherelle_admin_events (client_id, event_type, title)
    values (
      new.client_id,
      'intake_submitted',
      coalesce(client_name, 'Een klant') || ' heeft een intake verstuurd'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists cherelle_intake_submitted_event on public.cherelle_intakes;
create trigger cherelle_intake_submitted_event
after insert or update of submitted_at on public.cherelle_intakes
for each row
execute function public.cherelle_event_intake_submitted();

create table if not exists public.cherelle_newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  recipient_count integer not null default 0,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now()
);

alter table public.cherelle_newsletters enable row level security;
revoke all on public.cherelle_newsletters from anon, authenticated;
grant select, insert on public.cherelle_newsletters to authenticated;

drop policy if exists "Admins can read newsletters" on public.cherelle_newsletters;
create policy "Admins can read newsletters"
on public.cherelle_newsletters
for select
to authenticated
using (
  exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can log newsletters" on public.cherelle_newsletters;
create policy "Admins can log newsletters"
on public.cherelle_newsletters
for insert
to authenticated
with check (
  sent_by = (select auth.uid())
  and exists (
    select 1 from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

grant update (name, updated_at) on public.cherelle_clients to authenticated;

create or replace function public.cherelle_sync_client_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.email is distinct from new.email and new.email is not null then
    update public.cherelle_clients
    set email = lower(new.email), updated_at = now()
    where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists cherelle_sync_client_email_trigger on auth.users;
create trigger cherelle_sync_client_email_trigger
after update of email on auth.users
for each row
execute function public.cherelle_sync_client_email();

create or replace function public.cherelle_admin_dashboard_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  amsterdam_day_start timestamptz;
begin
  if not exists (
    select 1 from public.cherelle_admins a
    where a.user_id = auth.uid()
  ) then
    raise exception 'Geen beheerrechten';
  end if;

  amsterdam_day_start :=
    date_trunc('day', timezone('Europe/Amsterdam', now())) at time zone 'Europe/Amsterdam';

  return jsonb_build_object(
    'clients_total', (select count(*) from public.cherelle_clients),
    'clients_active', (select count(*) from public.cherelle_clients where activated_at is not null and status <> 'archived'),
    'visitors_today', (
      select count(distinct session_id)
      from public.cherelle_page_views
      where created_at >= amsterdam_day_start
    ),
    'visitors_7d', (
      select count(distinct session_id)
      from public.cherelle_page_views
      where created_at >= now() - interval '7 days'
    ),
    'visitors_30d', (
      select count(distinct session_id)
      from public.cherelle_page_views
      where created_at >= now() - interval '30 days'
    ),
    'page_views_today', (
      select count(*)
      from public.cherelle_page_views
      where created_at >= amsterdam_day_start
    ),
    'unread_activity', (
      select count(*)
      from public.cherelle_admin_events
      where read_at is null
    )
  );
end;
$$;

revoke all on function public.cherelle_admin_dashboard_metrics() from public;
grant execute on function public.cherelle_admin_dashboard_metrics() to authenticated;
