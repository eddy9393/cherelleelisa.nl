-- Optional month/year for a testimonial experience.
-- The first day of the selected month is stored; the website only displays month + year.

alter table public.cherelle_reviews
  add column if not exists experience_date date;
