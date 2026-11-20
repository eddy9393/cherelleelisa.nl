-- Optional person photo for testimonials / reviews.
alter table public.cherelle_reviews
  add column if not exists image_url text,
  add column if not exists image_storage_path text;
