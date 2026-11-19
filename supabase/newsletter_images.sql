-- Store public newsletter image URLs with each sent newsletter.

alter table public.cherelle_newsletters
  add column if not exists image_urls text[] not null default '{}';
