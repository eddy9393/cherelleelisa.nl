-- Mark only validated human-like page views as countable in the admin dashboard.

alter table public.cherelle_page_views
  add column if not exists verified boolean not null default false;

create index if not exists cherelle_page_views_verified_created_idx
  on public.cherelle_page_views (verified, created_at desc);

create or replace function public.cherelle_admin_dashboard_metrics()
returns jsonb
language plpgsql
security invoker
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
      where verified = true and created_at >= amsterdam_day_start
    ),
    'visitors_7d', (
      select count(distinct session_id)
      from public.cherelle_page_views
      where verified = true and created_at >= now() - interval '7 days'
    ),
    'visitors_30d', (
      select count(distinct session_id)
      from public.cherelle_page_views
      where verified = true and created_at >= now() - interval '30 days'
    ),
    'page_views_today', (
      select count(*)
      from public.cherelle_page_views
      where verified = true and created_at >= amsterdam_day_start
    ),
    'unread_activity', (
      select count(*) from public.cherelle_admin_events where read_at is null
    )
  );
end;
$$;

revoke all on function public.cherelle_admin_dashboard_metrics() from public, anon;
grant execute on function public.cherelle_admin_dashboard_metrics() to authenticated;
