// Stripe → AutoVerkauf webhooks (spec §5).
// - Signature verified on EVERY event.
// - Idempotent: keyed on the Stripe event ID via stripe_events; repeats are
//   acknowledged and ignored.
// Deploy with verify_jwt = false (Stripe cannot send a Supabase JWT).

import Stripe from "npm:stripe@18";
import { db, json, stripeClient } from "../_shared/clients.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return json({ error: "STRIPE_WEBHOOK_SECRET not set" }, 500);

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "missing signature" }, 400);

  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, secret);
  } catch (err) {
    console.error("signature verification failed", err);
    return json({ error: "invalid signature" }, 400);
  }

  const supabase = db();

  // Idempotency (§5): first insert wins; a replayed event is a no-op.
  const { error: dupErr } = await supabase
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (dupErr) {
    if (dupErr.code === "23505") return json({ received: true, duplicate: true });
    console.error("stripe_events insert failed", dupErr);
    return json({ error: "event log failed" }, 500); // Stripe will retry
  }

  try {
    switch (event.type) {
      // ── Monthly invoice settled: subscription + that month's wins are paid ──
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        // Mark the won_matches whose invoice items rode this invoice as paid.
        const itemIds = invoiceItemIds(invoice);
        if (itemIds.length > 0) {
          await supabase
            .from("won_matches")
            .update({ status: "paid" })
            .in("stripe_invoice_item_id", itemIds)
            .eq("status", "invoiced");
        }

        // A paid invoice is also proof the payment method works.
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          await supabase
            .from("garages")
            .update({ subscription_status: "active", payment_method_valid: true, suspended: false })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      // ── Dunning (§5): Stripe retries; when retries are exhausted, soft-suspend ──
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const exhausted = invoice.next_payment_attempt == null;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId && exhausted) {
          // past_due + can_offer=false (derived): account kept, no new offers
          // until they settle. Existing accepted matches still bill (§6).
          await supabase
            .from("garages")
            .update({ subscription_status: "past_due", suspended: true })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      // ── Keep subscription state + the can_offer gate in sync ──
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const status = mapSubStatus(sub.status);
        const periodEnd = sub.items?.data?.[0]?.current_period_end ??
          (sub as unknown as { current_period_end?: number }).current_period_end;
        const tier = sub.items?.data?.[0]?.price?.lookup_key ??
          sub.items?.data?.[0]?.price?.nickname ?? null;

        await supabase
          .from("subscriptions")
          .upsert(
            {
              stripe_subscription_id: sub.id,
              status,
              tier,
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
              garage_id: await garageIdFor(supabase, customerId),
            },
            { onConflict: "stripe_subscription_id" },
          );
        await supabase
          .from("garages")
          .update({ subscription_status: status, ...(tier ? { tier } : {}) })
          .eq("stripe_customer_id", customerId);
        break;
      }

      // ── Payment method saved during onboarding (§2 gate, second half) ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (customerId && (session.mode === "setup" || session.mode === "subscription")) {
          await supabase
            .from("garages")
            .update({ payment_method_valid: true })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      // ── Immediate-charge mode only (§2 alternative): same dunning path ──
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const customerId = typeof pi.customer === "string" ? pi.customer : pi.customer?.id;
        if (customerId) {
          await supabase
            .from("garages")
            .update({ payment_method_valid: false })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      // ── Disputes (§6): a garage that disputes wins gets flagged for review ──
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = typeof dispute.charge === "string"
          ? await stripe.charges.retrieve(dispute.charge)
          : dispute.charge;
        const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id;
        if (customerId) {
          await supabase
            .from("garages")
            .update({ flagged_for_review: true })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      default:
        // Logged in stripe_events; nothing to do.
        break;
    }
  } catch (err) {
    console.error(`handler failed for ${event.type}`, err);
    // Remove the idempotency marker so Stripe's redelivery gets a clean retry.
    await supabase.from("stripe_events").delete().eq("id", event.id);
    return json({ error: "handler failed" }, 500);
  }

  return json({ received: true });
});

/** Invoice-item IDs on an invoice, tolerant of API-version shape changes. */
function invoiceItemIds(invoice: Stripe.Invoice): string[] {
  const ids: string[] = [];
  for (const line of invoice.lines?.data ?? []) {
    const legacy = (line as unknown as { invoice_item?: string | { id: string } }).invoice_item;
    const modern = (line as unknown as {
      parent?: { invoice_item_details?: { invoice_item?: string } };
    }).parent?.invoice_item_details?.invoice_item;
    const id = typeof legacy === "string" ? legacy : legacy?.id ?? modern;
    if (id) ids.push(id);
  }
  return ids;
}

function mapSubStatus(s: Stripe.Subscription.Status): "active" | "past_due" | "canceled" | "incomplete" {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "incomplete";
  }
}

async function garageIdFor(
  supabase: ReturnType<typeof db>,
  stripeCustomerId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("garages")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();
  if (error || !data) throw new Error(`no garage for customer ${stripeCustomerId}`);
  return data.id;
}
