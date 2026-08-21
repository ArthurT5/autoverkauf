#!/usr/bin/env node
// One-time Stripe bootstrap for AutoVerkauf garage billing (test mode first).
// Creates the subscription products + CHF prices and prints the IDs to put
// into supabase secrets (STRIPE_PRICE_STARTER / STRIPE_PRICE_PRO).
//
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
//
// Idempotent: prices are looked up by lookup_key before anything is created.
//
// BUSINESS MODEL (locked 2026-08-21): plans differ ONLY by offer volume —
// Starter = capped offers/month (limit in billing_config), Pro = unlimited.
// AutoVerkauf takes NO commission on sales; the per-win fee machinery stays
// at 0/disabled. These amounts are the real public pricing (dealer page
// mirrors them) — change here, re-run, update the page.

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is required (use the sk_test_ key first).");
  process.exit(1);
}
if (!key.startsWith("sk_test_")) {
  console.warn("⚠️  Not a test key — you are about to create LIVE products.");
}

// Spec §10: TWINT recurring needs API 2026-05-27 or later. Stripe version
// strings carry a release suffix; this is the current dahlia release.
const API_VERSION = "2026-07-29.dahlia";

const TIERS = [
  {
    lookupKey: "starter",
    productName: "AutoVerkauf Garage — Starter",
    monthlyChf: 49,
    description: "Bis zu 10 Angebote pro Monat. Alle 26 Kantone, Händler-Dashboard, Käuferkontakt bei Zuschlag. Keine Verkaufskommission.",
  },
  {
    lookupKey: "pro",
    productName: "AutoVerkauf Garage — Pro",
    monthlyChf: 149,
    description: "Unbegrenzte Angebote. Alle 26 Kantone, Händler-Dashboard, Käuferkontakt bei Zuschlag. Keine Verkaufskommission.",
  },
];

async function stripe(path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": API_VERSION,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? new URLSearchParams(params) : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${path}: ${body.error?.message ?? res.status}`);
  return body;
}

const out = {};
for (const tier of TIERS) {
  // Idempotency: reuse an existing price with this lookup_key.
  const existing = await stripe(
    `prices?lookup_keys[]=${encodeURIComponent(tier.lookupKey)}&active=true&limit=1`,
  );
  if (existing.data.length > 0) {
    out[tier.lookupKey] = existing.data[0].id;
    console.log(`✓ ${tier.lookupKey}: exists → ${existing.data[0].id}`);
    continue;
  }

  const product = await stripe("products", {
    name: tier.productName,
    description: tier.description,
    "metadata[tier]": tier.lookupKey,
  });
  const price = await stripe("prices", {
    product: product.id,
    currency: "chf",
    unit_amount: String(Math.round(tier.monthlyChf * 100)),
    "recurring[interval]": "month",
    lookup_key: tier.lookupKey,
    tax_behavior: "exclusive", // MWST added on top via Stripe Tax (spec §6)
    nickname: tier.lookupKey,
  });
  out[tier.lookupKey] = price.id;
  console.log(`✓ ${tier.lookupKey}: created product ${product.id}, price ${price.id} (CHF ${tier.monthlyChf}/mt + MWST)`);
}

console.log("\nAdd to supabase secrets (supabase/functions/.env):");
for (const [tierKey, priceId] of Object.entries(out)) {
  console.log(`STRIPE_PRICE_${tierKey.toUpperCase()}=${priceId}`);
}
console.log(`
Next steps (once, in the Stripe Dashboard):
  1. Enable TWINT in Settings → Payment methods (CHF account required).
  2. Enable Stripe Tax and set the business address (MWST 8.1% is computed
     by Stripe, never hardcoded — spec §6).
  3. Create a webhook endpoint → https://<project-ref>.functions.supabase.co/stripe-webhook
     Events: invoice.paid, invoice.payment_failed, customer.subscription.updated,
     customer.subscription.deleted, checkout.session.completed,
     payment_intent.payment_failed, charge.dispute.created
     → copy the signing secret into STRIPE_WEBHOOK_SECRET.
`);
