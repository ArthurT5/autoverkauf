# Monetisation backend — implementation map & runbook

Implements [`monetisation-spec.md`](./monetisation-spec.md). Buyers are always
free; garages pay a subscription plus a per-won-match fee. The billable event
is **"buyer accepts a garage's offer"** — observed on-platform, billed exactly
once, server-authoritative throughout.

## Spec → code map

| Spec | Where |
| --- | --- |
| §2 gate (sub + payment method before offers) | `garage_can_offer()` in the migration; enforced again inside `accept_offer()` |
| §2 mechanism (invoice items ride the monthly bill) | `supabase/functions/_shared/jobs.ts` (`collection_mode` config allows `immediate`/`credits` later) |
| §3 data model | `supabase/migrations/20260821000000_monetisation.sql` — `garages`, `requests`, `offers`, `won_matches` (**UNIQUE offer_id**), `subscriptions`, plus `billing_config`, `stripe_events`, `stripe_jobs` |
| §4 acceptance transaction | Postgres fn `accept_offer(uuid)` — one transaction, idempotent, fee from server config |
| §4.6 Stripe retry queue | `stripe_jobs` table + `process-stripe-jobs` worker, idempotency key `won_match:<id>` |
| §5 webhooks | `supabase/functions/stripe-webhook` — signature verified, idempotent on event ID via `stripe_events` |
| §6 reversal window | Postgres fn `void_won_match(uuid)` + `void_invoice_item` job; window in `billing_config.reversal_window_hours` |
| §6 VAT / §10 CHF | Stripe Tax (`automatic_tax`), `tax_behavior: exclusive`; everything CHF; TWINT cap guardable via `fee_max_chf` |
| §7 rollout | `billing_config.fees_enabled = false` by default — plumbing runs, charges are CHF 0, flipping fees on is an UPDATE, not a deploy |
| §10 payment methods | `onboard-garage`: Checkout with `["twint","card"]` (API pinned `2026-05-27` for TWINT recurring) or `billing_method: "qr_invoice"` → `send_invoice` subscription for bank-transfer garages |
| §11.1 buyer data protection | `requests.buyer_email` never exposed; garages read `requests_for_garages` view |

Not built (per spec): escrow / holding purchase money (§11.2 — lawyer sign-off
required first) and financing/insurance referrals (§9 — regulated, phase two).

## Deploy runbook

Prereqs: a Supabase project (free tier fine) and a Stripe account (test mode).

```bash
# 0. Tooling (no global installs needed)
npx supabase login                     # interactive — browser auth

# 1. Link + push schema
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push                   # applies the migration

# 2. Stripe bootstrap (test mode)
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
#    → prints STRIPE_PRICE_STARTER / STRIPE_PRICE_PRO
#    → then in the Stripe Dashboard: enable TWINT + Stripe Tax, create the
#      webhook endpoint (URL + events are printed by the script)

# 3. Secrets
cp supabase/functions/.env.example supabase/functions/.env   # fill in
npx supabase secrets set --env-file supabase/functions/.env

# 4. Deploy functions
npx supabase functions deploy stripe-webhook accept-offer onboard-garage process-stripe-jobs

# 5. Schedule the retry worker (Supabase Dashboard → Integrations → Cron):
#    every minute → POST https://<ref>.functions.supabase.co/process-stripe-jobs
#    header: x-admin-key: <ADMIN_API_KEY>
```

### Test-mode smoke test

```bash
# Onboard a garage (returns a Checkout URL — pay with Stripe test card 4242…)
curl -X POST https://<ref>.functions.supabase.co/onboard-garage \
  -H "x-admin-key: $ADMIN_API_KEY" -H "content-type: application/json" \
  -d '{"name":"Testgarage Zürich","email":"garage@example.ch","tier":"starter"}'

# After Checkout + webhooks: garage.subscription_status=active,
# payment_method_valid=true → can_offer flips true.

# Insert a request + offer via SQL editor, then accept:
curl -X POST https://<ref>.functions.supabase.co/accept-offer \
  -H "content-type: application/json" \
  -d '{"offer_id":"<uuid>","token":"<hmac>"}'
# token = HMAC-SHA256(offer_id, ACCEPT_TOKEN_SECRET) hex — the buyer's email
# link carries it. Re-POSTing is a no-op (same won_match, no second charge).
```

Use **Stripe test clocks** to simulate a month rolling over: the invoice picks
up the subscription + all `invoiced` win fees, `invoice.paid` marks them
`paid` (§8 checklist).

## Go-live switches (no redeploy)

```sql
-- Flip fees on when buyer volume is real (§7):
update billing_config set fees_enabled = true, fee_mode = 'flat', fee_flat_chf = 190;
-- or a percentage with a cap under the TWINT 5'000 ceiling (§10):
update billing_config set fees_enabled = true, fee_mode = 'percent',
  fee_percent_bp = 150, fee_max_chf = 4500;  -- 1.5%, capped
```

Swap `sk_test_` secrets for live keys, re-run `stripe-setup.mjs` against live,
re-point the webhook, done.

## Open items (flagged, not forgotten)

- **Placeholder prices** in `scripts/stripe-setup.mjs` (CHF 49/149) — confirm
  real tiers with the business; the public pricing section is also marked
  placeholder.
- **QR-bill compliance**: Stripe's hosted invoice may not emit a Swiss QR
  payment part; if garages demand it, add a QR-bill generator on top of the
  `send_invoice` flow and reconcile via the `QRR` reference (§10).
- **Buyer accept UI**: `accept-offer` expects the HMAC-tokenised link from the
  offer email — the email sending itself is not built yet.
- **Legal** (§11): T&Cs (intermediary, not party to the sale), privacy policy
  (revFADP), imprint, VAT registration timing — all lawyer/accountant items,
  DRAFT only, nothing invented in code.
