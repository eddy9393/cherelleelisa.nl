-- Security hardening for dashboard and trigger functions.
-- Applied to the Cherelle Elisa Supabase project.

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

revoke all on function public.cherelle_admin_dashboard_metrics() from public, anon;
grant execute on function public.cherelle_admin_dashboard_metrics() to authenticated;

revoke all on function public.cherelle_event_account_activated() from public, anon, authenticated;
revoke all on function public.cherelle_event_intake_submitted() from public, anon, authenticated;
revoke all on function public.cherelle_sync_client_email() from public, anon, authenticated;
