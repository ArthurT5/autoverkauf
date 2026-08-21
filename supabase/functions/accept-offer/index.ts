// Buyer accepts offer X (spec §4). The database function accept_offer() runs
// the whole state transition as ONE transaction with UNIQUE(offer_id) as the
// bill-once guarantee; this endpoint just authenticates the call and then
// best-effort flushes the queued Stripe job (the cron worker is the backstop).
//
// Auth: buyers have no accounts — the "choose this offer" email link carries
// an HMAC token bound to the offer ID (ACCEPT_TOKEN_SECRET). Nothing about
// amounts or fees is read from the client (§8).

import { db, json, verifyAcceptToken } from "../_shared/clients.ts";
import { processJobs } from "../_shared/jobs.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { offer_id?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const { offer_id, token } = body;
  if (!offer_id || !token) return json({ error: "offer_id and token required" }, 400);
  if (!(await verifyAcceptToken(offer_id, token))) {
    return json({ error: "invalid token" }, 401);
  }

  const supabase = db();
  const { data: wonMatch, error } = await supabase.rpc("accept_offer", { p_offer_id: offer_id });

  if (error) {
    const known: Record<string, [string, number]> = {
      offer_not_found: ["This offer no longer exists.", 404],
      offer_not_open: ["This offer is no longer open.", 409],
      garage_not_billable: ["This offer is no longer available.", 409],
    };
    for (const [code, [message, status]] of Object.entries(known)) {
      if (error.message.includes(code)) return json({ error: code, message }, status);
    }
    console.error("accept_offer failed", error);
    return json({ error: "acceptance failed" }, 500);
  }

  // §4.5/§4.6: try to report to Stripe right away; on failure the job stays
  // queued and the scheduled worker retries with won_match.id as the
  // idempotency key. Never blocks or reverses the acceptance.
  try {
    await processJobs(supabase, { wonMatchId: wonMatch.id });
  } catch (err) {
    console.error("inline stripe flush failed (worker will retry)", err);
  }

  return json({ accepted: true, won_match_id: wonMatch.id });
});
