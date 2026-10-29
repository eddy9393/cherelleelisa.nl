-- Cherelle Elisa CMS schema
-- Run this in a dedicated Supabase project for cherelleelisa.nl.
-- After creating the first Auth user, add that user to cherelle_admins manually
-- from the SQL editor using the user's UUID.

create extension if not exists pgcrypto;

create table if not exists public.cherelle_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.cherelle_content (
  key text primary key,
  value_nl text not null default '',
  value_en text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.cherelle_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_nl text,
  role_en text,
  quote_nl text not null,
  quote_en text not null default '',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cherelle_media (
  slot text primary key,
  storage_path text not null,
  public_url text not null,
  alt_nl text,
  alt_en text,
  updated_at timestamptz not null default now()
);

alter table public.cherelle_admins enable row level security;
alter table public.cherelle_content enable row level security;
alter table public.cherelle_reviews enable row level security;
alter table public.cherelle_media enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.cherelle_content to anon, authenticated;
grant select on public.cherelle_reviews to anon, authenticated;
grant select on public.cherelle_media to anon, authenticated;
grant select on public.cherelle_admins to authenticated;

grant insert, update, delete on public.cherelle_content to authenticated;
grant insert, update, delete on public.cherelle_reviews to authenticated;
grant insert, update, delete on public.cherelle_media to authenticated;

drop policy if exists "Cherelle admins can read own membership" on public.cherelle_admins;
create policy "Cherelle admins can read own membership"
on public.cherelle_admins
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Cherelle content is public" on public.cherelle_content;
create policy "Cherelle content is public"
on public.cherelle_content
for select
to anon, authenticated
using (true);

drop policy if exists "Cherelle admins can insert content" on public.cherelle_content;
create policy "Cherelle admins can insert content"
on public.cherelle_content
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can update content" on public.cherelle_content;
create policy "Cherelle admins can update content"
on public.cherelle_content
for update
to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can delete content" on public.cherelle_content;
create policy "Cherelle admins can delete content"
on public.cherelle_content
for delete
to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Published Cherelle reviews are public" on public.cherelle_reviews;
drop policy if exists "Authenticated users can read Cherelle reviews" on public.cherelle_reviews;

create policy "Published Cherelle reviews are public"
on public.cherelle_reviews
for select
to anon
using (is_published);

create policy "Authenticated users can read Cherelle reviews"
on public.cherelle_reviews
for select
to authenticated
using (
  is_published
  or exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can insert reviews" on public.cherelle_reviews;
create policy "Cherelle admins can insert reviews"
on public.cherelle_reviews
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can update reviews" on public.cherelle_reviews;
create policy "Cherelle admins can update reviews"
on public.cherelle_reviews
for update
to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can delete reviews" on public.cherelle_reviews;
create policy "Cherelle admins can delete reviews"
on public.cherelle_reviews
for delete
to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle media metadata is public" on public.cherelle_media;
create policy "Cherelle media metadata is public"
on public.cherelle_media
for select
to anon, authenticated
using (true);

drop policy if exists "Cherelle admins can insert media metadata" on public.cherelle_media;
create policy "Cherelle admins can insert media metadata"
on public.cherelle_media
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can update media metadata" on public.cherelle_media;
create policy "Cherelle admins can update media metadata"
on public.cherelle_media
for update
to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can delete media metadata" on public.cherelle_media;
create policy "Cherelle admins can delete media metadata"
on public.cherelle_media
for delete
to authenticated
using (
  exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

insert into storage.buckets (id, name, public)
values ('cherelle-media', 'cherelle-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Cherelle media is publicly readable" on storage.objects;
create policy "Cherelle media is publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'cherelle-media');

drop policy if exists "Cherelle admins can upload media" on storage.objects;
create policy "Cherelle admins can upload media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cherelle-media'
  and exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can update media" on storage.objects;
create policy "Cherelle admins can update media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'cherelle-media'
  and exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'cherelle-media'
  and exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

drop policy if exists "Cherelle admins can delete media" on storage.objects;
create policy "Cherelle admins can delete media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'cherelle-media'
  and exists (
    select 1
    from public.cherelle_admins a
    where a.user_id = (select auth.uid())
  )
);

-- Example (replace UUID after creating the Auth account):
-- insert into public.cherelle_admins (user_id) values ('00000000-0000-0000-0000-000000000000');
