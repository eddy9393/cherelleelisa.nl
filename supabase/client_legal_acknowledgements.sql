-- Stores one-time acknowledgement of the legal documents for client accounts
-- and explicit consent for processing health data in the intake.

alter table public.cherelle_clients
  add column if not exists privacy_acknowledged_at timestamptz,
  add column if not exists terms_acknowledged_at timestamptz;

alter table public.cherelle_intakes
  add column if not exists health_data_consent boolean not null default false,
  add column if not exists health_data_consent_at timestamptz;
