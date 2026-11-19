-- Allow Cherelle admins to clear newsletter history records.
-- Newsletter images remain in storage so images in already-received emails keep working.

grant delete on public.cherelle_newsletters to authenticated;

drop policy if exists "Admins can delete newsletter history" on public.cherelle_newsletters;
create policy "Admins can delete newsletter history"
on public.cherelle_newsletters
for delete
to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);
