// Garage onboarding (spec §2.1): create the garage + Stripe Customer, then a
// Checkout Session that both starts the subscription and saves a reusable
// payment method. Until the webhook confirms both, garage_can_offer() stays
// false — the §2 gate that guarantees every visible offer is billable.
//
// Payment methods (§10): TWINT first (recurring supported from API version
// 2026-05-27 — pinned in _shared/clients.ts; CHF-only, one mandate per
// merchant–customer pair, CHF 5'000/txn cap), card as fallback. QR-bill
// garages: pass billing_method = "qr_invoice" to get a send_invoice
// subscription settled by bank transfer against a monthly invoice.
//
// MVP auth: x-admin-key (called from our own onboarding flow, not public).

import { db, json, requireAdminKey, stripeClient } from "../_shared/clients.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const denied = requireAdminKey(req);
  if (denied) return denied;

  let body: {
    name?: string;
    email?: string;
    canton?: string;
    tier?: string;                      // maps to STRIPE_PRICE_<TIER> secret
    billing_method?: "checkout" | "qr_invoice";
    success_url?: string;
    cancel_url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const { name, email, canton, tier = "starter", billing_method = "checkout" } = body;
  if (!name || !email) return json({ error: "name and email required" }, 400);

  const priceId = Deno.env.get(`STRIPE_PRICE_${tier.toUpperCase()}`);
  if (!priceId) return json({ error: `no price configured for tier "${tier}"` }, 400);

  const supabase = db();
  const stripe = stripeClient();

  // Reuse an existing garage by email (idempotent onboarding).
  const { data: existing } = await supabase
    .from("garages")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  let garage = existing;
  if (!garage) {
    const { data, error } = await supabase
      .from("garages")
      .insert({ name, email, canton, tier })
      .select()
      .single();
    if (error) return json({ error: "garage create failed", detail: error.message }, 500);
    garage = data;
  }

  // One Stripe Customer per garage. (Also: one TWINT mandate per
  // merchant–customer pair — reuse, never recreate; §10.)
  let customerId = garage.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create(
      {
        name,
        email,
        metadata: { garage_id: garage.id },
        // Swiss B2B: Stripe Tax computes MWST from the customer's address
        // once collected in Checkout (§6 — rate is config, never code).
      },
      { idempotencyKey: `garage_customer:${garage.id}` },
    );
    customerId = customer.id;
    await supabase.from("garages").update({ stripe_customer_id: customerId }).eq("id", garage.id);
  }

  if (billing_method === "qr_invoice") {
    // Traditional-garage path (§10): monthly invoice settled by bank
    // transfer. Stripe emails the hosted invoice; a Swiss QR-bill payment
    // part can be layered on via a QR-bill provider if Stripe's bank
    // transfer output isn't compliant in our setup (see docs).
    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        collection_method: "send_invoice",
        days_until_due: 30,
      },
      { idempotencyKey: `garage_sub:${garage.id}` },
    );
    // Invoice-settled garages have no card/TWINT mandate; the "payment
    // method" is the standing invoice relationship. Billability still flips
    // on the invoice.paid webhook.
    await supabase
      .from("garages")
      .update({ payment_method_valid: true })
      .eq("id", garage.id);
    return json({ garage_id: garage.id, subscription_id: subscription.id, mode: "qr_invoice" });
  }

  // Default: Checkout — subscription + saved payment method in one step.
  const origin = Deno.env.get("PUBLIC_SITE_URL") ?? "http://localhost:4321";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    payment_method_types: ["twint", "card"],   // §10: TWINT preferred, card fallback
    currency: "chf",
    success_url: body.success_url ?? `${origin}/haendler?onboarding=success`,
    cancel_url: body.cancel_url ?? `${origin}/haendler?onboarding=cancelled`,
    subscription_data: { metadata: { garage_id: garage.id } },
    automatic_tax: { enabled: true },          // MWST via Stripe Tax (§6)
    tax_id_collection: { enabled: true },      // B2B: collect the garage's UID/VAT no.
    billing_address_collection: "required",
  });

  return json({ garage_id: garage.id, checkout_url: session.url, mode: "checkout" });
});
