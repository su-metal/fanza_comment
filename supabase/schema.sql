-- Source of Truth:
-- - Comments are NOT stored in Supabase.
-- - Comments are stored/restored as local JSON only.
-- - Supabase is used only for paid entitlement judgement.

create extension if not exists "uuid-ossp";

-- License records used for entitlement checks.
create table if not exists license_entitlements (
  id uuid primary key default uuid_generate_v4(),
  app_id text not null default 'fanza_comment',
  license_code text not null unique,
  purchase_email_hash text not null,
  status text not null check (status in ('active', 'revoked', 'refunded')),
  product text not null default 'kamishine_memo_pro_lifetime',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  last_verified_at timestamptz,
  verification_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional device claim log for abuse control and support operations.
create table if not exists license_claims (
  id uuid primary key default uuid_generate_v4(),
  app_id text not null default 'fanza_comment',
  license_id uuid not null references license_entitlements(id) on delete cascade,
  device_fingerprint_hash text not null,
  app_version text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (app_id, license_id, device_fingerprint_hash)
);

create index if not exists idx_license_entitlements_app_status
  on license_entitlements(app_id, status);

create index if not exists idx_license_entitlements_payment_intent
  on license_entitlements(stripe_payment_intent_id);

create index if not exists idx_license_claims_license_id
  on license_claims(license_id);

-- Stripe webhook idempotency guard.
create table if not exists webhook_events (
  event_id text primary key,
  event_type text not null,
  processed boolean not null default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

-- Server-side API only. No direct client access from anon/auth roles.
alter table license_entitlements enable row level security;
alter table license_claims enable row level security;
alter table webhook_events enable row level security;
