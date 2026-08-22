# AutoVerkauf — Launch plan (A → Z)

Status baseline (2026-08-22): core loop feature-complete and E2E-tested on
localhost. Supabase live (with test data), Stripe test mode wired, Resend in
sandbox, branch `save/wip-2026-08-06`. Not deployed, no legal pages, Google
OAuth unwired, billing gate off, email confirmations off.

Legend: **[YOU]** = only you can do it · **[ME]** = I do it · **[EXT]** = external party

---

## Phase 1 — Staging deploy (now)

1. **[YOU]** Create a Vercel account (free Hobby tier is fine to start) and
   either connect the GitHub repo or hand me a deploy token.
2. **[ME]** Merge `save/wip-2026-08-06` → `main`; swap `@astrojs/node` for the
   Vercel adapter; set env vars (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`).
3. **[ME]** Deploy → `autoverkauf.vercel.app`; update Supabase auth
   `site_url`/allow-list + `PUBLIC_SITE_URL` secret; full smoke test on the
   staging URL (wizard → offer → accept → emails).
4. ✅ Exit: you can click through the whole product from your phone.

## Phase 2 — Domain & email identity

1. **[YOU]** Point `autoverkauf.ch` DNS to Vercel (A/CNAME records I'll give
   you); confirm where DNS is managed.
2. **[YOU]** Resend → Domains → add `autoverkauf.ch` → add the 3–4 DNS records
   (SPF/DKIM). Wait for "Verified".
3. **[ME]** Switch senders to `no-reply@autoverkauf.ch` (notifications + auth
   mails), re-test dealer broadcast to non-owner addresses.
4. **[YOU]** Google Cloud Console → OAuth client (I'll give exact origins +
   redirect URIs) → paste client ID/secret.
5. **[ME]** Enable Google provider in Supabase; test Google sign-in.
6. ✅ Exit: real domain, working emails to anyone, Google login live.

## Phase 3 — Content & legal (DRAFT → lawyer) — can run parallel to 1–2

1. **[ME]** Draft pages, clearly marked DRAFT: Impressum, Datenschutz
   (revFADP: what we store, processors = Supabase/Stripe/Resend/Vercel),
   AGB-Käufer, AGB-Händler (intermediary — not party to the sale; fees;
   suspension), /kontakt. Footer links go real. ×4 locales.
2. **[YOU]** Confirm the legal entity + address for the Impressum (company
   name, UID if any — never invented by me).
3. **[EXT]** Swiss lawyer (fintech + data) reviews: T&C structure, privacy,
   "verified dealers" claim wording, VAT registration timing. Brief =
   `docs/monetisation-spec.md` §11.
4. **[EXT]** Accountant: MWST setup + Stripe Tax validation.
5. ✅ Exit: lawyer-approved legal pages replace drafts.

## Phase 4 — Payments go-live (dealer side)

1. **[YOU]** Stripe: activate live mode (business verification — needs the
   legal entity), enable **TWINT** + **Stripe Tax** in the live dashboard.
2. **[ME]** Live keys → re-run `scripts/stripe-setup.mjs` against live →
   live webhook endpoint → swap Supabase secrets.
3. **[ME]** Flip `billing_config.billing_gate_enabled = true` — from then on
   dealers must subscribe (Checkout: TWINT/card, or QR-invoice path) before
   they can send offers. Quota (10/mt Starter) already enforced.
4. **[YOU]** One real subscription with your own card/TWINT as final proof;
   cancel or keep as the house account.
5. Optional business lever: first-month-free trial for founding dealers
   (one flag in the checkout call — say the word).
6. ✅ Exit: a stranger dealer can apply, get approved, pay, and offer.

## Phase 5 — Hardening & QA

1. **[ME]** Wipe ALL test data (`*@example.ch` users, requests, offers,
   garages, storage photos, notification/stripe job logs).
2. **[ME]** Re-enable email confirmations (`mailer_autoconfirm=false`) — safe
   once the Resend domain is live.
3. **[ME]** Mobile + cross-browser QA pass (wizard, both dashboards, login).
4. **[ME]** Accessibility pass (WCAG 2.1 AA) + Lighthouse performance on the
   marketing pages.
5. **[ME]** SEO: sitemap, hreflang across the 4 locales, per-page meta,
   robots; **[YOU]** add the site to Google Search Console.
6. **[YOU]** Rotate every credential pasted during development (Supabase
   access token, Stripe test key stays test-only, Resend key optional).
7. **[ME]** Uptime monitor + error alerting (simple: Vercel + Supabase log
   alerts; Sentry optional).
8. **[YOU]** Decide on analytics: recommend Plausible/Fathom (privacy-first,
   no cookie banner needed). I wire it.
9. ✅ Exit: clean database, confirmed-email signups, monitored, fast, AA.

## Phase 6 — Supply before demand (the cold-start rule)

A marketplace launch dies if the first buyers get zero offers. Dealers first.

1. **[YOU]** Personally recruit **5–15 garages** (start ZH/BE or wherever your
   network is). Pitch: real buyer demand, CHF 49/mt, no commission, cancel
   anytime*(subject to AGB)*. I produce a one-page dealer pitch (DE/FR) +
   the pricing link.
2. **[ME]** White-glove onboarding: approve applications same-day (still one
   SQL call — I'll build a small admin approval page if volume warrants).
3. ✅ Exit: enough dealer coverage that a plausible request gets ≥2 offers
   within 24h.

## Phase 7 — Launch

1. **Soft launch (1–2 weeks):** friends/family submit real requests; watch
   every notification, offer and acceptance; fix friction daily.
2. **Public launch:** announce (LinkedIn, local auto forums, Comparis-adjacent
   communities); consider a small paid test (Google Ads on "auto kaufen
   [kanton]" intent).
3. **[YOU]** Send the AutoScout24/SMG partnership email
   (`docs/autoscout24-partnership.md`) once there's a traction number to cite.
4. ✅ Exit: strangers on both sides transacting without hand-holding.

## Phase 8 — Post-launch ops & next features

- Support inbox (`kontakt@autoverkauf.ch` → your mail).
- Admin page for dealer approval + request moderation.
- Offer expiry & request auto-close; buyer "close my request".
- Pro-plan value: priority notifications + statistics (currently promised on
  the pricing page — must exist within a reasonable window).
- AutoScout24 API integration when the partnership lands.
- Financing/insurance referrals: **only** after legal clearance (§11.2 —
  licensed-partner model).

---

## Critical-path summary

```
Vercel account [YOU] → staging [ME] → DNS + Resend domain [YOU] → real emails [ME]
                                   ↘ legal drafts [ME] → lawyer [EXT] ─┐
Google OAuth keys [YOU] → Google login [ME]                            ├→ hardening [ME] → dealers [YOU] → soft launch → LAUNCH
Stripe live [YOU] → billing gate on [ME] ──────────────────────────────┘
```

The only hard blockers on *you* right now: **(1) Vercel account, (2) DNS
access, (3) legal entity details, (4) Stripe live activation.** Everything
else I execute.
