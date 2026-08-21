// Stripe job processor (spec §4.5–§4.6): report won-match fees to Stripe as
// invoice items on the garage's customer, so each garage gets ONE clean
// monthly bill = subscription + that month's wins (§2 collection_mode
// 'invoice'). Retried safely: the Stripe idempotency key is derived from
// won_match.id, so a crashed run can never double-bill.

import type Stripe from "npm:stripe@18";
import { chfToRappen, db, stripeClient } from "./clients.ts";

const MAX_ATTEMPTS = 8;

export async function processJobs(
  supabase: ReturnType<typeof db>,
  opts: { wonMatchId?: string; limit?: number } = {},
): Promise<{ done: number; failed: number }> {
  const stripe = stripeClient();

  let query = supabase
    .from("stripe_jobs")
    .select("*")
    .in("status", ["queued", "failed"])
    .lt("attempts", MAX_ATTEMPTS)
    .lte("run_after", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(opts.limit ?? 20);
  if (opts.wonMatchId) query = query.eq("won_match_id", opts.wonMatchId);

  const { data: jobs, error } = await query;
  if (error) throw error;

  let done = 0, failed = 0;
  for (const job of jobs ?? []) {
    // Claim the job (optimistic lock on status).
    const { data: claimed } = await supabase
      .from("stripe_jobs")
      .update({ status: "processing", attempts: job.attempts + 1 })
      .eq("id", job.id)
      .in("status", ["queued", "failed"])
      .select()
      .single();
    if (!claimed) continue; // another worker got it

    try {
      if (job.kind === "invoice_item") await createInvoiceItem(supabase, stripe, job);
      else if (job.kind === "void_invoice_item") await voidInvoiceItem(supabase, stripe, job);
      await supabase.from("stripe_jobs").update({ status: "done", last_error: null }).eq("id", job.id);
      done++;
    } catch (err) {
      const backoffMinutes = Math.min(2 ** job.attempts, 120); // 1m → 2h cap
      await supabase
        .from("stripe_jobs")
        .update({
          status: "failed",
          last_error: String(err).slice(0, 1000),
          run_after: new Date(Date.now() + backoffMinutes * 60_000).toISOString(),
        })
        .eq("id", job.id);
      failed++;
    }
  }
  return { done, failed };
}

async function createInvoiceItem(
  supabase: ReturnType<typeof db>,
  stripe: Stripe,
  job: { id: string; won_match_id: string },
) {
  const { data: wm, error } = await supabase
    .from("won_matches")
    .select("*, garages(stripe_customer_id), requests(make, model)")
    .eq("id", job.won_match_id)
    .single();
  if (error || !wm) throw new Error(`won_match ${job.won_match_id} not found`);
  if (wm.status === "voided") return;             // reversed before we reported it
  if (wm.stripe_invoice_item_id) return;          // already reported (idempotent)
  const customerId = wm.garages?.stripe_customer_id;
  if (!customerId) throw new Error(`garage for won_match ${wm.id} has no stripe_customer_id`);

  const car = [wm.requests?.make, wm.requests?.model].filter(Boolean).join(" ") || "request";
  const item = await stripe.invoiceItems.create(
    {
      customer: customerId,
      currency: "chf",                                     // §6: everything CHF
      amount: chfToRappen(wm.fee_amount_chf),
      description: `AutoVerkauf Vermittlungsgebühr — ${car} (Match ${wm.id.slice(0, 8)})`,
    },
    { idempotencyKey: `won_match:${wm.id}` },              // §4.6 bill-once at Stripe too
  );

  await supabase
    .from("won_matches")
    .update({ stripe_invoice_item_id: item.id, status: "invoiced" })
    .eq("id", wm.id)
    .eq("status", "pending");
}

async function voidInvoiceItem(
  supabase: ReturnType<typeof db>,
  stripe: Stripe,
  job: { id: string; won_match_id: string },
) {
  const { data: wm, error } = await supabase
    .from("won_matches")
    .select("id, stripe_invoice_item_id")
    .eq("id", job.won_match_id)
    .single();
  if (error || !wm) throw new Error(`won_match ${job.won_match_id} not found`);
  if (!wm.stripe_invoice_item_id) return;

  try {
    await stripe.invoiceItems.del(wm.stripe_invoice_item_id);
  } catch (err) {
    // Already on a finalized invoice → §6 says manual credit; surface loudly.
    throw new Error(`could not delete invoice item ${wm.stripe_invoice_item_id}: ${err}`);
  }
  await supabase
    .from("won_matches")
    .update({ stripe_invoice_item_id: null })
    .eq("id", wm.id);
}
