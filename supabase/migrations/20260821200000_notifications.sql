
-- ============================================================================
-- Notifications: outbox queue + triggers + instant poke + cron sweep.
-- The core loop finally speaks: buyers hear about offers, dealers hear about
-- requests and wins. Emails are rendered/sent by the send-notifications
-- edge function (Resend); this layer only records WHAT happened, reliably.
-- ============================================================================

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Locale per audience so emails match the language they used.
alter table public.requests            add column if not exists locale text not null default 'de';
alter table public.dealer_applications add column if not exists locale text not null default 'de';
alter table public.garages             add column if not exists locale text not null default 'de';

-- Private endpoint config (function URL + shared key). RLS on, NO policies:
-- only service role / definer functions can read it.
create table if not exists public.internal_config (
  key   text primary key,
  value text not null
);
alter table public.internal_config enable row level security;
insert into public.internal_config (key, value) values
  ('functions_base_url', 'https://zogxrzwfmpeitktdvwnk.supabase.co/functions/v1'),
  ('admin_api_key', 'SET_VIA_DASHBOARD_OR_DEPLOY')
on conflict (key) do update set value = excluded.value;

-- Outbox
create table if not exists public.notification_jobs (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('request_received', 'request_matched', 'offer_received', 'offer_won')),
  payload     jsonb not null default '{}',
  status      text not null default 'queued' check (status in ('queued', 'processing', 'done', 'failed')),
  attempts    integer not null default 0,
  last_error  text,
  run_after   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
alter table public.notification_jobs enable row level security;

-- Fire-and-forget poke so emails go out within seconds; the cron sweep is
-- the reliability backstop. Never lets a notification problem block the
-- business write.
create or replace function public.poke_notifications()
returns void language plpgsql security definer set search_path = public as $fn$
declare
  base text; k text;
begin
  select value into base from internal_config where key = 'functions_base_url';
  select value into k    from internal_config where key = 'admin_api_key';
  perform net.http_post(
    url := base || '/send-notifications',
    headers := jsonb_build_object('x-admin-key', k, 'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 5000
  );
exception when others then
  null;
end;
$fn$;

-- Triggers: record the event, then poke.
create or replace function public.on_request_created()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  insert into notification_jobs (kind, payload) values
    ('request_received', jsonb_build_object('request_id', new.id)),
    ('request_matched',  jsonb_build_object('request_id', new.id));
  perform poke_notifications();
  return new;
end;
$fn$;
drop trigger if exists trg_request_created on public.requests;
create trigger trg_request_created after insert on public.requests
  for each row execute function public.on_request_created();

create or replace function public.on_offer_created()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  insert into notification_jobs (kind, payload)
  values ('offer_received', jsonb_build_object('offer_id', new.id));
  perform poke_notifications();
  return new;
end;
$fn$;
drop trigger if exists trg_offer_created on public.offers;
create trigger trg_offer_created after insert on public.offers
  for each row execute function public.on_offer_created();

create or replace function public.on_offer_accepted()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into notification_jobs (kind, payload)
    values ('offer_won', jsonb_build_object('offer_id', new.id));
    perform poke_notifications();
  end if;
  return new;
end;
$fn$;
drop trigger if exists trg_offer_accepted on public.offers;
create trigger trg_offer_accepted after update on public.offers
  for each row execute function public.on_offer_accepted();

-- Cron sweeps: retry queued/failed notifications + flush Stripe jobs.
select cron.unschedule(jobname) from cron.job where jobname in ('notify-sweep', 'stripe-jobs-sweep');
select cron.schedule('notify-sweep', '* * * * *', $cmd$
  select net.http_post(
    url := (select value from public.internal_config where key = 'functions_base_url') || '/send-notifications',
    headers := jsonb_build_object('x-admin-key', (select value from public.internal_config where key = 'admin_api_key'), 'Content-Type', 'application/json'),
    body := '{}'::jsonb, timeout_milliseconds := 8000)
$cmd$);
select cron.schedule('stripe-jobs-sweep', '* * * * *', $cmd$
  select net.http_post(
    url := (select value from public.internal_config where key = 'functions_base_url') || '/process-stripe-jobs',
    headers := jsonb_build_object('x-admin-key', (select value from public.internal_config where key = 'admin_api_key'), 'Content-Type', 'application/json'),
    body := '{}'::jsonb, timeout_milliseconds := 8000)
$cmd$);

-- Approval copies the applicant's locale onto the garage.
create or replace function public.approve_dealer_application(p_application_id uuid)
returns public.garages
language plpgsql security definer set search_path = public as $fn$
declare
  a public.dealer_applications%rowtype;
  g public.garages%rowtype;
begin
  select * into a from dealer_applications where id = p_application_id for update;
  if not found then raise exception 'application_not_found'; end if;
  if a.status = 'approved' then
    select * into g from garages where email = a.email;
    return g;
  end if;
  insert into garages (owner_id, name, email, canton, locale)
  values (a.user_id, a.company_name, a.email, a.canton, coalesce(a.locale, 'de'))
  returning * into g;
  update dealer_applications set status = 'approved', decided_at = now() where id = a.id;
  return g;
end;
$fn$;
