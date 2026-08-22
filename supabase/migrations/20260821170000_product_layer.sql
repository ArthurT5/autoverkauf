-- ============================================================================
-- AutoVerkauf — product layer: accounts, dealer applications, rich offers,
-- dashboard RLS, contact reveal on acceptance.
-- Buyers: email+password / Google via Supabase Auth. Dealers: apply → manual
-- approval creates the garage and links the owner account.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Buyer profiles (1:1 with auth.users; created by trigger on signup)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  phone        text,                    -- optional; part of the contact reveal
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name',
                           new.raw_user_meta_data ->> 'full_name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Requests belong to an account now (wizard creates the account on submit).
-- buyer_email stays for the contact reveal; still never shown to garages
-- until acceptance.
-- ---------------------------------------------------------------------------
alter table public.requests add column buyer_id uuid references auth.users (id);
create index requests_buyer_idx on public.requests (buyer_id);

-- ---------------------------------------------------------------------------
-- Offers carry the full car: firm price + exact spec + photos + optional
-- dealer message. Every offered car must come from an AutoScout24 listing
-- (already-verified inventory); the URL is first-class so a future SMG API
-- integration can auto-fill and re-verify the spec.
-- ---------------------------------------------------------------------------
alter table public.offers
  add column make          text,
  add column model         text,
  add column trim          text,
  add column first_reg     integer,             -- year of first registration
  add column km            integer,
  add column fuel          text,
  add column gear          text,
  add column color         text,
  add column photos        text[] not null default '{}',  -- storage object paths
  add column message       text,                -- optional note from the dealer
  add column autoscout_url text not null default '',
  add constraint offers_autoscout_domain check (
    autoscout_url = '' or autoscout_url ~* '^https://(www\.)?autoscout24\.ch/'
  );

-- ---------------------------------------------------------------------------
-- Dealer applications (§ "apply → we approve"; the vetting behind
-- "verified Swiss dealers"). Approval is manual for now.
-- ---------------------------------------------------------------------------
create type public.application_status as enum ('submitted', 'approved', 'rejected');

create table public.dealer_applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id),   -- the account that applied
  company_name  text not null,
  uid           text,                              -- Swiss UID (CHE-…)
  contact_name  text not null,
  email         text not null,
  phone         text,
  canton        text,
  cantons_served text[] not null default '{}',
  autoscout_dealer_url text,                       -- their AutoScout24 dealer page
  note          text,
  status        public.application_status not null default 'submitted',
  created_at    timestamptz not null default now(),
  decided_at    timestamptz
);

-- Approval: creates the garage, links the applicant as owner.
create or replace function public.approve_dealer_application(p_application_id uuid)
returns public.garages
language plpgsql security definer set search_path = public as $$
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

  insert into garages (owner_id, name, email, canton)
  values (a.user_id, a.company_name, a.email, a.canton)
  returning * into g;

  update dealer_applications
    set status = 'approved', decided_at = now()
    where id = a.id;
  return g;
end;
$$;
revoke execute on function public.approve_dealer_application(uuid) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Contact reveal (after accept, both ways — the platform's job ends here).
-- Exposed via SECURITY DEFINER functions so the visibility rule lives in one
-- place: only for offers in status 'accepted', only to the two parties.
-- ---------------------------------------------------------------------------
create or replace function public.contact_for_offer(p_offer_id uuid)
returns table (
  role         text,          -- 'buyer' or 'garage' = who the caller is
  name         text,
  email        text,
  phone        text
)
language plpgsql security definer set search_path = public as $$
declare
  o public.offers%rowtype;
  r public.requests%rowtype;
  g public.garages%rowtype;
begin
  select * into o from offers where id = p_offer_id;
  if not found or o.status <> 'accepted' then return; end if;
  select * into r from requests where id = o.request_id;
  select * into g from garages where id = o.garage_id;

  -- caller is the buyer → return the garage's card
  if r.buyer_id = auth.uid() then
    return query select 'garage'::text, g.name, g.email,
      (select p.phone from profiles p where p.id = g.owner_id);
  -- caller is the garage owner → return the buyer's card
  elsif g.owner_id = auth.uid() then
    return query select 'buyer'::text,
      (select coalesce(p.display_name, r.buyer_email) from profiles p where p.id = r.buyer_id),
      r.buyer_email,
      (select p.phone from profiles p where p.id = r.buyer_id);
  end if;
  -- anyone else: empty result
end;
$$;
grant execute on function public.contact_for_offer(uuid) to authenticated;

-- Buyer-side acceptance from the dashboard: session-authenticated wrapper
-- around the §4 transactional accept_offer(). The HMAC email-link path stays
-- for buyers who never open the dashboard.
create or replace function public.accept_my_offer(p_offer_id uuid)
returns public.won_matches
language plpgsql security definer set search_path = public as $$
declare
  r_buyer uuid;
begin
  select r.buyer_id into r_buyer
    from offers o join requests r on r.id = o.request_id
    where o.id = p_offer_id;
  if r_buyer is null or r_buyer <> auth.uid() then
    raise exception 'not_your_request' using errcode = 'P0001';
  end if;
  return public.accept_offer(p_offer_id);
end;
$$;
grant execute on function public.accept_my_offer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS for the dashboards
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.dealer_applications enable row level security;

-- profiles: own row only
create policy "own profile read"   on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid());

-- requests: buyers see + create their own
create policy "buyer reads own requests" on public.requests for select
  using (buyer_id = auth.uid());
create policy "buyer creates own request" on public.requests for insert
  with check (buyer_id = auth.uid());

-- offers: buyers see offers on their requests (garage owners already had select)
create policy "buyer reads offers on own requests" on public.offers for select
  using (request_id in (select id from public.requests where buyer_id = auth.uid()));

-- offers: a billable garage owner submits offers on open requests
create policy "garage owner submits offers" on public.offers for insert
  with check (
    garage_id in (
      select id from public.garages g
      where g.owner_id = auth.uid() and public.garage_can_offer(g)
    )
    and request_id in (select id from public.requests where status = 'open')
  );

-- garages: owner may update non-billing profile fields (billing columns are
-- guarded by trigger below)
create policy "garage owner updates own garage" on public.garages for update
  using (owner_id = auth.uid());

create or replace function public.guard_garage_billing_columns()
returns trigger language plpgsql as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'authenticated' then
    -- billing state only moves via service role / webhooks
    new.stripe_customer_id   := old.stripe_customer_id;
    new.subscription_status  := old.subscription_status;
    new.tier                 := old.tier;
    new.payment_method_valid := old.payment_method_valid;
    new.suspended            := old.suspended;
    new.flagged_for_review   := old.flagged_for_review;
  end if;
  return new;
end;
$$;
create trigger garages_guard_billing
  before update on public.garages
  for each row execute function public.guard_garage_billing_columns();

-- dealer applications: applicant sees their own; anyone signed-in may apply
create policy "applicant reads own application" on public.dealer_applications for select
  using (user_id = auth.uid());
create policy "signed-in user applies" on public.dealer_applications for insert
  with check (user_id = auth.uid());

-- requests_for_garages view: approved garage owners browse open demand.
-- (View reads with invoker rights so the underlying RLS applies.)
alter view public.requests_for_garages set (security_invoker = false);
-- Garages need to see open requests they don't own → dedicated policy on the
-- base table, limited to non-PII columns via the view. RLS can't do column
-- security, so: grant garages select on requests ONLY through the view by
-- keeping the view security_definer (owner = postgres, bypasses RLS) and
-- revoking direct selects beyond the buyer policy above.
revoke select on public.requests from anon;
grant  select on public.requests_for_garages to authenticated;
revoke select on public.requests_for_garages from anon;

-- won_matches: buyer may see matches on their requests (garage policy exists)
create policy "buyer reads own won matches" on public.won_matches for select
  using (request_id in (select id from public.requests where buyer_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage: offer photos (dealers upload real photos of the actual car)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('offer-photos', 'offer-photos', true)
on conflict (id) do nothing;

create policy "garage owners upload offer photos"
  on storage.objects for insert
  with check (
    bucket_id = 'offer-photos'
    and exists (select 1 from public.garages g where g.owner_id = auth.uid())
  );
create policy "offer photos are public"
  on storage.objects for select using (bucket_id = 'offer-photos');

-- Public garage card: what a buyer may see about a dealer pre-acceptance.
create or replace view public.garages_public as
  select id, name, canton from public.garages;
grant select on public.garages_public to authenticated;
revoke select on public.garages_public from anon;

-- Pre-launch: billing gate OFF (approved garages can offer without Stripe).
-- At launch: UPDATE billing_config SET billing_gate_enabled = true — then the
-- §2 sub+payment-method gate applies again. No redeploy either way.
alter table public.billing_config
  add column if not exists billing_gate_enabled boolean not null default true;
update public.billing_config set billing_gate_enabled = false;

create or replace function public.garage_can_offer(g public.garages)
returns boolean language sql stable as $$
  select (not g.suspended) and (
    (select not billing_gate_enabled from public.billing_config)
    or (g.subscription_status = 'active' and g.payment_method_valid)
  )
$$;

-- Fix: the offer-insert policy checked requests directly, but the dealer's
-- RLS on requests hides all rows -> policy always failed. Security definer
-- helper sees through.
create or replace function public.request_is_open(p_request_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from requests where id = p_request_id and status = 'open')
$$;

drop policy "garage owner submits offers" on public.offers;
create policy "garage owner submits offers" on public.offers for insert
  with check (
    garage_id in (
      select id from public.garages g
      where g.owner_id = auth.uid() and public.garage_can_offer(g)
    )
    and public.request_is_open(request_id)
  );

-- garage_can_offer reads billing_config, which is RLS-locked -> inside an
-- RLS policy (invoker rights) it returned NULL for garage owners. Security
-- definer: it only ever exposes a boolean.
create or replace function public.garage_can_offer(g public.garages)
returns boolean language sql stable security definer set search_path = public as $$
  select (not g.suspended) and (
    (select not billing_gate_enabled from public.billing_config)
    or (g.subscription_status = 'active' and g.payment_method_valid)
  )
$$;

-- Business model locked: plans differ ONLY by offer volume. No commission,
-- no per-sale fee (per-win fee machinery stays dormant at 0 / disabled).
alter table public.billing_config
  add column if not exists starter_monthly_offer_limit integer not null default 10;

-- Client-readable limit (single scalar, nothing sensitive).
create or replace view public.plan_limits as
  select starter_monthly_offer_limit from public.billing_config;
grant select on public.plan_limits to authenticated;
revoke select on public.plan_limits from anon;

-- Quota gate: Pro = unlimited; Starter (or no tier yet) = capped per
-- calendar month. SECURITY DEFINER — used inside the offers insert policy.
create or replace function public.garage_within_offer_quota(p_garage_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select tier from garages where id = p_garage_id), 'starter') = 'pro'
      or (select count(*) from offers o
            where o.garage_id = p_garage_id
              and o.created_at >= date_trunc('month', now()))
         < (select starter_monthly_offer_limit from billing_config)
$$;

drop policy "garage owner submits offers" on public.offers;
create policy "garage owner submits offers" on public.offers for insert
  with check (
    garage_id in (
      select id from public.garages g
      where g.owner_id = auth.uid() and public.garage_can_offer(g)
    )
    and public.request_is_open(request_id)
    and public.garage_within_offer_quota(garage_id)
  );

-- Users may create their own profile row (signup trigger normally does it,
-- but client-side upserts need the insert path too).
create policy "own profile insert" on public.profiles for insert
  with check (id = auth.uid());
