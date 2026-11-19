-- Cherelle Elisa client portal and intake
-- Applied to the Cherelle Elisa Supabase project.

create table if not exists public.cherelle_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'completed', 'archived')),
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(email))
);

create table if not exists public.cherelle_intakes (
  client_id uuid primary key references public.cherelle_clients(id) on delete cascade,
  birth_date date,
  phone text,
  intention text,
  energy_experience_level text
    check (energy_experience_level is null or energy_experience_level in ('none', 'basic', 'advanced')),
  intense_energy_experience boolean,
  intense_energy_details text,
  physical_conditions boolean,
  physical_conditions_details text,
  medications boolean,
  medications_details text,
  meditation_breathwork_experience boolean,
  meditation_breathwork_details text,
  mental_health_or_trauma boolean,
  mental_health_or_trauma_details text,
  stimulants boolean,
  stimulants_details text,
  contraindications_acknowledged boolean not null default false,
  declaration_accepted boolean not null default false,
  signature_name text,
  signature_date date,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.cherelle_clients enable row level security;
alter table public.cherelle_intakes enable row level security;

revoke all on public.cherelle_clients from anon;
revoke all on public.cherelle_intakes from anon;

grant select on public.cherelle_clients to authenticated;
grant update (status, activated_at, updated_at) on public.cherelle_clients to authenticated;
grant select, insert, update on public.cherelle_intakes to authenticated;

drop policy if exists "Clients and admins can read client records" on public.cherelle_clients;
create policy "Clients and admins can read client records"
on public.cherelle_clients
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Clients can activate own record" on public.cherelle_clients;
create policy "Clients can activate own record"
on public.cherelle_clients
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Clients and admins can read intake" on public.cherelle_intakes;
create policy "Clients and admins can read intake"
on public.cherelle_intakes
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
          select 1
          from public.cherelle_admins a
          where a.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "Clients and admins can create intake" on public.cherelle_intakes;
create policy "Clients and admins can create intake"
on public.cherelle_intakes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cherelle_clients c
    where c.id = client_id
      and (
        c.user_id = (select auth.uid())
        or exists (
          select 1
          from public.cherelle_admins a
          where a.user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "Clients and admins can update intake" on public.cherelle_intakes;
create policy "Clients and admins can update intake"
on public.cherelle_intakes
for update
to authenticated
using (
  exists (
    select 1
    from public.cherelle_clients c
    where c.id = client_id
      and (
        c.user_id = (select auth.uid())
        or exists (
          select 1
          from public.cherelle_admins a
          where a.user_id = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.cherelle_clients c
    where c.id = client_id
      and (
        c.user_id = (select auth.uid())
        or exists (
          select 1
          from public.cherelle_admins a
          where a.user_id = (select auth.uid())
        )
      )
  )
);

create index if not exists cherelle_clients_status_idx
  on public.cherelle_clients (status, created_at desc);

create index if not exists cherelle_clients_user_id_idx
  on public.cherelle_clients (user_id);
