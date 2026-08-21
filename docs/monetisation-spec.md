# AutoVerkauf — Monetisation: Backend Integration Spec

**For:** backend developer
**Purpose:** implement garage-side billing. Buyers are always free. Two revenue lines in MVP: (1) a **per-won-match fee**, (2) a **garage subscription**. Financing/insurance referrals are noted as a later phase, not built here.

---

## 1. The one idea everything hangs off

The billable event is **"buyer accepts a garage's offer."** That acceptance happens inside our platform, so we can observe it, bill it exactly once, and tie a clear amount to it. We do **not** bill on lead access, and we do **not** try to verify the real-world final car sale (that completes offline and can't be trusted). Bill the accepted offer, keep the fee low enough that routing around it isn't worth the garage's effort.

Two consequences the developer must respect throughout:

- **Server is authoritative.** The offer amount and the fee are computed and stored server-side. Never trust a client-supplied amount or fee.
- **Acceptance is idempotent.** A double-click, retry, or webhook replay must never create two charges for the same offer.

---

## 2. Recommended mechanism (MVP)

Use **Stripe** (supports CHF, subscriptions, tax, invoicing). Concretely:

1. **Garage onboarding creates a Stripe Customer** and collects a payment method (Stripe `SetupIntent` / Checkout in setup mode) — see **§10 for which CHF payment methods to enable (TWINT, card, QR-bill)**. A garage **cannot submit offers until** it has (a) an active subscription and (b) a valid saved payment method / mandate. This is the key gate — it guarantees that any offer a buyer sees is from a garage we can actually bill, so a buyer never accepts an "unbillable" offer.
2. **Subscription** is a standard Stripe Billing subscription (monthly, tiered).
3. **Per-win fee**: on acceptance, add the fee as a Stripe **invoice item** on that garage's customer. It rides the next monthly invoice alongside the subscription, so the garage gets **one clean monthly bill** = subscription + that month's wins. (Alternative if you want cash up front: charge an off-session `PaymentIntent` immediately on acceptance, or a **prepaid-credits** model where each win decrements a balance. Monthly invoicing is the least friction for garages; credits are safest for our cash flow. Pick one and keep it behind a config flag — see §7.)

Fee amount is **config, not hardcoded**: either a flat CHF amount or a percentage of the offer value. Store it so we can tune it and so we can launch at zero (see §7 rollout).

---

## 3. Data model (additions)

- **garage**: `stripe_customer_id`, `subscription_status` (`active` / `past_due` / `canceled`), `tier`, `payment_method_valid` (bool), `can_offer` (derived gate).
- **request**: the buyer's demand (already exists). Add `status` (`open` / `fulfilled` / `closed`).
- **offer**: `garage_id`, `request_id`, `amount_chf`, `status` (`submitted` / `accepted` / `rejected` / `expired`), `accepted_at`.
- **won_match** (new, the billing record): `offer_id` **(UNIQUE)**, `garage_id`, `request_id`, `fee_amount_chf`, `currency`, `status` (`pending` → `invoiced` → `paid`, plus `voided`), `stripe_invoice_item_id`, `created_at`. The **unique constraint on `offer_id` is what enforces bill-once** at the database level.
- **subscription**: `garage_id`, `tier`, `stripe_subscription_id`, `status`, `current_period_end`.

---

## 4. Acceptance → billing flow

When the buyer accepts offer X, run this as **one database transaction**, keyed on `offer.id` for idempotency:

1. Re-check server-side that offer X is still `submitted` and its garage is billable. If not, stop.
2. Set `offer.status = accepted`, `accepted_at = now`. Set `request.status = fulfilled`. Decide the product rule for the losing offers (recommend: mark them `rejected` and notify — a buyer picks exactly one garage per request).
3. **Insert a `won_match` row** for offer X. The UNIQUE(`offer_id`) constraint makes a duplicate insert fail harmlessly — that's the idempotency guarantee.
4. Compute `fee_amount_chf` from server-side config and the stored offer amount.
5. Report to Stripe: create an invoice item on the garage's customer (or charge/decrement per the chosen mechanism). Store the Stripe reference on the `won_match`.
6. Commit. Then emit an internal event and notify the garage ("You won this match").

If step 5 (Stripe) fails after commit, retry from a queue using `won_match.id` as the idempotency key — never re-run steps 1–4.

---

## 5. Webhooks (Stripe → us)

Handle at minimum, and **verify the signature on every one**:

- `invoice.paid` → mark that period's `won_match` rows and subscription `paid`.
- `invoice.payment_failed` → start dunning; after Stripe's retries exhaust, set garage `past_due` and flip `can_offer = false` (soft-suspend: they keep their account but can't submit new offers until they settle).
- `customer.subscription.updated` / `deleted` → sync `subscription_status` and the `can_offer` gate.
- `payment_intent.payment_failed` (only if using immediate-charge mechanism) → same dunning path.

Webhooks must be **idempotent** too (Stripe can redeliver): key handlers on the Stripe event ID and ignore repeats.

---

## 6. Edge cases to handle explicitly

- **Buyer accepts then regrets:** define a short reversal window (e.g. a few hours) during which the match can be `voided` and the invoice item removed; after that, only a manual credit. Don't leave this undefined.
- **Garage's payment method dies between onboarding and a win:** the §2 gate should prevent an unbillable garage from being live, but also re-check billability at acceptance (step 1) as a backstop.
- **Subscription lapses:** `can_offer = false`; existing accepted matches still bill.
- **Disputes / chargebacks:** handle `charge.dispute.created`; a garage that disputes wins gets flagged for review.
- **Swiss VAT (MWST):** garage fees are B2B services and VAT applies (standard rate is currently **8.1%** — confirm the live rate and have an accountant validate invoice format; Swiss invoices have specific requirements). Stripe Tax can compute and add it. Don't bake the rate into code — treat it as config.
- **Currency:** everything in **CHF**; format with the Swiss apostrophe grouping (39'200) on the invoice-facing side.

---

## 7. Rollout order (important — don't skip)

Monetisation that's correct at scale can kill the marketplace at zero liquidity. Ship the billing plumbing **behind a feature flag / config with the fee set to 0 (or fees waived)** first. Build garage supply density with free wins. Only flip the fee on once buyer volume is real. Because fee amount and "fees enabled" are config, this is a switch, not a redeploy.

---

## 8. Security / correctness checklist

- Fee and offer amount computed and stored server-side; client values ignored.
- UNIQUE(`offer_id`) on `won_match` + transactional acceptance = bill exactly once.
- Stripe webhook signatures verified; handlers idempotent on event ID.
- Garage gated on active subscription **and** valid payment method before it can submit offers.
- All money in CHF; VAT handled as config, not hardcoded.
- Test with Stripe test mode + test clocks for subscription cycles before going live.

---

## 9. Out of scope here (phase two)

Referral commissions on **financing, leasing, insurance, warranty, trade-in** at the moment of purchase intent. Different integration (affiliate/referral tracking, partner payouts) and potentially larger revenue than the fees above — worth a separate spec once the core loop is live. **Note the licensing catch in §11.2 before building this** — it is not legally free money.

---

## 10. Swiss payment methods (CHF-first)

Everything is priced and billed in **CHF**. Format amounts with the Swiss apostrophe grouping (e.g. `CHF 1'490`) on all invoice- and garage-facing surfaces. Because the payers are **garages (businesses)**, not consumers, offer three methods behind the §2 billing gate:

- **TWINT — preferred, enable first.** Switzerland's dominant payment app. Historically single-use only, but Stripe now supports TWINT for **subscriptions, recurring billing, and off-session payments** (added in the `2026-05-27` API version — the integration must pin Stripe API version `2026-05-27` or later to use it). Constraints for the dev: **CHF only**, **one active mandate per merchant–customer pair** (creating a second mandate for the same garage returns an error — reuse the existing one), and a **per-transaction cap of CHF 5'000** (fine for subscription + monthly win fees; only a concern if a single invoice ever exceeds it — if using a % fee on high-value cars, watch this ceiling and split or fall back to invoice).
- **Card** — fallback and familiar; supports recurring off-session cleanly. Keep as a secondary option.
- **QR-bill (QR-Rechnung) / bank transfer** — the Swiss B2B invoice standard. Traditional garages will expect to settle a monthly invoice from their business bank account. This maps directly onto the monthly-invoice model (§2): issue one monthly invoice (subscription + that month's wins) with a Swiss QR-bill. If Stripe's bank-transfer / invoicing tooling doesn't produce a compliant Swiss QR-bill in your setup, use a Swiss QR-bill library/provider to generate the payment part + Swiss cross and reconcile via the structured reference (`QRR`).

**Forward-looking (not blocking, but design so you're not stranded):** the old Swiss direct-debit rail **LSV+ is being phased out (end of September 2028)**, and **TWINT is launching its own direct-debit scheme for recurring payments in 2027**. Betting on TWINT for recurring is therefore the future-proof path, not a stopgap.

---

## 11. Legal & compliance — orientation (NOT legal advice)

I'm not a lawyer, and this can't certify that the product is "legal." What follows is a map of the areas that apply so you can brief a **Swiss lawyer (fintech + data)** efficiently and not miss the load-bearing ones. The items in **11.1** are ordinary and manageable; **11.2** is the one that genuinely changes what you can build.

### 11.1 Standard, manageable

- **Data protection (revFADP / revDSG, in force since 1 Sept 2023; GDPR too if you serve EU residents).** Buyers submit personal data (contact details, the car they want). You need a privacy policy, a lawful basis, a record of processing, a cookie/consent banner, and a data-processing agreement with Stripe and any other processor. If the operating entity sits outside CH/EU you may need a local representative.
- **Platform terms & operator liability.** Draft clear T&Cs stating AutoVerkauf is an **intermediary that connects buyers and garages and is not a party to the vehicle sale**. This keeps the used-car warranty (Gewährleistung) and the sale contract with the garage, not you. Separate B2B terms govern the garage relationship (fees, billing, suspension).
- **"Verified garages" claims.** If you advertise garages as verified/vetted, you take on a duty to actually vet them, and unsubstantiated claims (e.g. "best price," savings figures) can breach the Unfair Competition Act (UWG/LCD). Only claim what you can prove, and define the vetting you actually perform.
- **Imprint + transparent pricing.** Swiss e-commerce/UWG expects a clear provider imprint (Impressum) and transparent fee disclosure to garages.
- **VAT (MWST).** Registration becomes mandatory once turnover passes **CHF 100'000**. Garage fees are taxable B2B services (standard rate currently **8.1%** — confirm live). Issue VAT-compliant invoices. Have an accountant set this up.
- **Don't call it an "auction" loosely.** Framing matters: this is a **request-for-offers / tender**, where garages submit offers a buyer chooses. Keep that language. A literal public "auction" (Versteigerung/enchère) can trigger cantonal auction-permit rules you don't want. The "live" mechanic is fine — just describe it as offers, not a legal auction.

### 11.2 The one that constrains the business — handling money and the phase-two referrals

- **Stay a fee-collector, not a fund-holder (for now).** As designed, money flows *from garages to you* as platform fees. That's ordinary B2B invoicing and does **not** by itself make you a regulated financial intermediary. The moment that changes is if you start **holding or routing the car-purchase money between buyer and garage** (escrow, "pay through AutoVerkauf"). That can pull you into financial-intermediary / anti-money-laundering (AMLA) territory and possible FINMA/SRO obligations. Using Stripe as processor keeps the regulated payment-handling with Stripe. **Recommendation: do not build escrow or hold client funds without a lawyer's sign-off.**
- **Financing & insurance referrals (the §9 phase-two idea) are regulated — this is the big flag.** Brokering these is not a free affiliate stream in Switzerland:
  - **Insurance:** an untied insurance intermediary **must be entered in FINMA's public register**, and since the revised Insurance Supervision Act (in force 1 Jan 2024) that requires, among other things, a **seat/branch in Switzerland, professional indemnity insurance (historically ≥ CHF 2M), proof of qualifications/training, and disclosure to the client of all compensation received.** Referring buyers to insurance for commission plausibly counts as intermediation. Assume you need to register (or partner with an already-registered intermediary who carries the obligations) before earning insurance commissions.
  - **Consumer financing/credit:** brokering consumer credit is governed by the **Consumer Credit Act (KKG/LCC)** — disclosure, affordability/creditworthiness checks, and in several cantons a **cantonal licence** for credit intermediaries. Again: partner with a licensed lender/broker rather than doing it raw.
  - **Practical path:** treat financing/insurance as **partnerships with already-licensed providers** who carry the regulatory burden, and structure your cut as a marketing/referral arrangement they're comfortable is compliant — vetted by counsel. Don't switch it on because it looks like easy commission; it's the part most likely to need a licence.

### 11.3 What to actually do

Brief a Swiss lawyer with fintech + data-protection experience on: the intermediary T&C structure, the revFADP privacy setup, VAT registration timing, and — before any phase-two work — the insurance/credit licensing question. Everything in §1–§10 can be built in parallel; only §9/§11.2 gates the financing/insurance expansion.
