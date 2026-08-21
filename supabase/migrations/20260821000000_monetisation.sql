-- ============================================================================
-- AutoVerkauf — monetisation backend (docs/monetisation-spec.md)
-- Buyers are always free. Garages pay (1) a subscription and (2) a per-won-
-- match fee. The billable event is "buyer accepts a garage's offer" (§1).
-- Server is authoritative; acceptance is idempotent; bill exactly once.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.subscription_status as enum ('incomplete', 'active', 'past_due', 'canceled');
create type public.request_status      as enum ('open', 'fulfilled', 'closed');
create type public.offer_status        as enum ('submitted', 'accepted', 'rejected', 'expired');
create type public.won_match_status    as enum ('pending', 'invoiced', 'paid', 'voided');
create type public.stripe_job_status   as enum ('queued', 'processing', 'done', 'failed');

-- ---------------------------------------------------------------------------
-- Billing config (§2, §7) — single row, server-side only. Fee is CONFIG, not
-- code: launch with fees_enabled = false (free wins build supply density),
-- flip on later without a redeploy.
-- ---------------------------------------------------------------------------
create table public.billing_config (
  id                     boolean primary key default true check (id), -- single-row table
  fees_enabled           boolean not null default false,              -- §7 rollout switch
  fee_mode               text    not null default 'flat' check (fee_mode in ('flat', 'percent')),
  fee_flat_chf           numeric(12,2) not null default 0,
  fee_percent_bp         integer not null default 0,                  -- basis points of offer amount (percent mode)
  fee_min_chf            numeric(12,2) not null default 0,
  fee_max_chf            numeric(12,2),                               -- cap; mind TWINT's CHF 5'000/txn ceiling (§10)
  collection_mode        text not null default 'invoice' check (collection_mode in ('invoice', 'immediate', 'credits')),
  reversal_window_hours  integer not null default 4,                  -- §6 buyer-regret window
  vat_via_stripe_tax     boolean not null default true,               -- §6 MWST: config, never hardcoded
  updated_at             timestamptz not null default now()
);
insert into public.billing_config default values;

-- ---------------------------------------------------------------------------
-- Garages (§3)
-- ---------------------------------------------------------------------------
create table public.garages (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid references auth.users (id),
  name                  text not null,
  email                 text not null,
  canton                text,
  stripe_customer_id    text unique,
  subscription_status   public.subscription_status not null default 'incomplete',
  tier                  text,
  payment_method_valid  boolean not null default false,
  suspended             boolean not null default false,  -- dunning / manual soft-suspend (§5)
  flagged_for_review    boolean not null default false,  -- dispute flag (§6)
  created_at            timestamptz not null default now()
);

-- §2 gate, derived: a garage may submit offers only when we can actually bill
-- it — so a buyer never accepts an "unbillable" offer.
create or replace function public.garage_can_offer(g public.garages)
returns boolean language sql stable as $$
  select g.subscription_status = 'active'
     and g.payment_method_valid
     and not g.suspended
$$;

-- ---------------------------------------------------------------------------
-- Requests (§3) — the buyer's demand. Columns mirror the /anfrage wizard
-- draft so the frontend can submit directly. Buyer contact stays private.
-- ---------------------------------------------------------------------------
create table public.requests (
  id             uuid primary key default gen_random_uuid(),
  status         public.request_status not null default 'open',
  make           text,
  model          text,
  model_similar  boolean not null default false, -- "or similar" flexibility
  body           text,
  budget_chf     numeric(12,2),
  year_from      integer,
  km_max         integer,
  fuel           text,
  gear           text,
  canton         text,
  radius_km      integer,
  plz            text,
  buyer_email    text not null,                  -- NEVER exposed to garages (revFADP, §11.1)
  created_at     timestamptz not null default now()
);

-- Garage-safe projection: everything except buyer contact details.
create view public.requests_for_garages as
  select id, status, make, model, model_similar, body, budget_chf,
         year_from, km_max, fuel, gear, canton, radius_km, created_at
  from public.requests;

-- ---------------------------------------------------------------------------
-- Offers (§3) — amount stored server-side; the fee is computed from THIS
-- stored value, never from anything client-supplied (§8).
-- ---------------------------------------------------------------------------
create table public.offers (
  id           uuid primary key default gen_random_uuid(),
  garage_id    uuid not null references public.garages (id),
  request_id   uuid not null references public.requests (id),
  amount_chf   numeric(12,2) not null check (amount_chf > 0),
  status       public.offer_status not null default 'submitted',
  accepted_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (garage_id, request_id)  -- one offer per garage per request
);
create index offers_request_idx on public.offers (request_id);
create index offers_garage_idx  on public.offers (garage_id);

-- ---------------------------------------------------------------------------
-- Won matches (§3) — THE billing record. UNIQUE(offer_id) is the database-
-- level bill-exactly-once guarantee (§4.3, §8).
-- ---------------------------------------------------------------------------
create table public.won_matches (
  id                      uuid primary key default gen_random_uuid(),
  offer_id                uuid not null unique references public.offers (id),
  garage_id               uuid not null references public.garages (id),
  request_id              uuid not null references public.requests (id),
  fee_amount_chf          numeric(12,2) not null,
  currency                text not null default 'CHF' check (currency = 'CHF'), -- §6: CHF only
  status                  public.won_match_status not null default 'pending',
  stripe_invoice_item_id  text,
  created_at              timestamptz not null default now(),
  voided_at               timestamptz
);
create index won_matches_garage_idx on public.won_matches (garage_id);

-- ---------------------------------------------------------------------------
-- Subscriptions (§3) — synced from Stripe via webhooks (§5).
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  garage_id               uuid not null references public.garages (id),
  tier                    text,
  stripe_subscription_id  text unique not null,
  status                  public.subscription_status not null default 'incomplete',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Stripe webhook idempotency (§5): key on the Stripe event ID, ignore repeats.
-- ---------------------------------------------------------------------------
create table public.stripe_events (
  id           text primary key,          -- evt_…
  type         text not null,
  received_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Stripe job queue (§4.6): if reporting to Stripe fails after the DB commit,
-- retry from here with won_match.id as the idempotency key — never re-run
-- the acceptance transaction.
-- ---------------------------------------------------------------------------
create table public.stripe_jobs (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('invoice_item', 'void_invoice_item')),
  won_match_id  uuid not null references public.won_matches (id),
  payload       jsonb not null default '{}',
  status        public.stripe_job_status not null default 'queued',
  attempts      integer not null default 0,
  last_error    text,
  run_after     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (kind, won_match_id)  -- one job of each kind per match
);

-- ===========================================================================
-- Acceptance → billing flow (§4). One transaction, keyed on offer.id.
-- Idempotent: re-calling for an already-accepted offer returns the existing
-- won_match instead of failing or double-billing.
-- ===========================================================================
create or replace function public.accept_offer(p_offer_id uuid)
returns public.won_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  o   public.offers%rowtype;
  g   public.garages%rowtype;
  cfg public.billing_config%rowtype;
  fee numeric(12,2);
  wm  public.won_matches%rowtype;
begin
  -- Lock the offer row: serialises double-clicks / concurrent retries.
  select * into o from offers where id = p_offer_id for update;
  if not found then
    raise exception 'offer_not_found' using errcode = 'P0002';
  end if;

  -- Idempotency: already accepted → return the existing billing record.
  if o.status = 'accepted' then
    select * into wm from won_matches where offer_id = o.id;
    return wm;
  end if;

  -- §4.1 re-check server-side: offer still open, garage still billable.
  if o.status <> 'submitted' then
    raise exception 'offer_not_open' using errcode = 'P0001';
  end if;
  select * into g from garages where id = o.garage_id for update;
  if not garage_can_offer(g) then
    raise exception 'garage_not_billable' using errcode = 'P0001';
  end if;

  -- §4.4 fee from server-side config × the STORED offer amount (§8).
  select * into cfg from billing_config;
  if not cfg.fees_enabled then
    fee := 0;  -- §7: launch at zero — plumbing runs, nothing is charged
  elsif cfg.fee_mode = 'flat' then
    fee := cfg.fee_flat_chf;
  else
    fee := round(o.amount_chf * cfg.fee_percent_bp / 10000.0, 2);
  end if;
  fee := greatest(fee, cfg.fee_min_chf);
  if cfg.fee_max_chf is not null then
    fee := least(fee, cfg.fee_max_chf);
  end if;

  -- §4.2 state transitions. Product rule: buyer picks exactly one garage per
  -- request → losing submitted offers are rejected (notify outside the txn).
  update offers   set status = 'accepted', accepted_at = now() where id = o.id;
  update requests set status = 'fulfilled' where id = o.request_id;
  update offers   set status = 'rejected'
    where request_id = o.request_id and id <> o.id and status = 'submitted';

  -- §4.3 the billing record. UNIQUE(offer_id) = bill exactly once.
  insert into won_matches (offer_id, garage_id, request_id, fee_amount_chf, currency, status)
  values (o.id, o.garage_id, o.request_id, fee, 'CHF', 'pending')
  returning * into wm;

  -- §4.5 report to Stripe — via the retry queue so a Stripe outage never
  -- rolls back or re-runs the acceptance.
  if fee > 0 then
    insert into stripe_jobs (kind, won_match_id, payload)
    values ('invoice_item', wm.id, jsonb_build_object('fee_chf', fee));
  else
    update won_matches set status = 'invoiced' where id = wm.id returning * into wm;
  end if;

  return wm;
end;
$$;

-- ===========================================================================
-- Reversal window (§6): buyer accepts then regrets. Inside the window the
-- match is voided and the invoice item removed; after it, manual credit only.
-- ===========================================================================
create or replace function public.void_won_match(p_won_match_id uuid)
returns public.won_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  wm  public.won_matches%rowtype;
  cfg public.billing_config%rowtype;
begin
  select * into wm from won_matches where id = p_won_match_id for update;
  if not found then
    raise exception 'won_match_not_found' using errcode = 'P0002';
  end if;
  if wm.status = 'voided' then
    return wm;  -- idempotent
  end if;
  select * into cfg from billing_config;
  if now() - wm.created_at > make_interval(hours => cfg.reversal_window_hours) then
    raise exception 'reversal_window_elapsed' using errcode = 'P0001';
  end if;

  update won_matches set status = 'voided', voided_at = now()
    where id = wm.id returning * into wm;
  update offers set status = 'rejected' where id = wm.offer_id;
  update requests set status = 'open' where id = wm.request_id;

  -- Remove the invoice item at Stripe if one was already created.
  if wm.stripe_invoice_item_id is not null then
    insert into stripe_jobs (kind, won_match_id)
    values ('void_invoice_item', wm.id)
    on conflict (kind, won_match_id) do nothing;
  else
    -- Not yet reported: cancel any pending invoice_item job.
    update stripe_jobs set status = 'done', last_error = 'voided before send'
      where won_match_id = wm.id and kind = 'invoice_item' and status in ('queued', 'failed');
  end if;

  return wm;
end;
$$;

-- ===========================================================================
-- Row-level security. MVP: all writes go through Edge Functions using the
-- service role (which bypasses RLS). Garage owners get read access to their
-- own rows for a future dashboard. Buyer contact details are never readable
-- by garages (use requests_for_garages).
-- ===========================================================================
alter table public.billing_config enable row level security;
alter table public.garages        enable row level security;
alter table public.requests       enable row level security;
alter table public.offers         enable row level security;
alter table public.won_matches    enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.stripe_events  enable row level security;
alter table public.stripe_jobs    enable row level security;

create policy "garage owner reads own garage"
  on public.garages for select
  using (owner_id = auth.uid());

create policy "garage owner reads own offers"
  on public.offers for select
  using (garage_id in (select id from public.garages where owner_id = auth.uid()));

create policy "garage owner reads own won matches"
  on public.won_matches for select
  using (garage_id in (select id from public.garages where owner_id = auth.uid()));

create policy "garage owner reads own subscriptions"
  on public.subscriptions for select
  using (garage_id in (select id from public.garages where owner_id = auth.uid()));

-- Functions are service-role / definer only; no anon execution.
revoke execute on function public.accept_offer(uuid)  from anon, authenticated;
revoke execute on function public.void_won_match(uuid) from anon, authenticated;
