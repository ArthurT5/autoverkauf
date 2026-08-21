// Scheduled worker (spec §4.6): flush queued/failed Stripe jobs with
// exponential backoff. Schedule via Supabase Cron (e.g. every minute) with
// the x-admin-key header; also safe to invoke manually.

import { db, json, requireAdminKey } from "../_shared/clients.ts";
import { processJobs } from "../_shared/jobs.ts";

Deno.serve(async (req) => {
  const denied = requireAdminKey(req);
  if (denied) return denied;

  try {
    const result = await processJobs(db(), { limit: 50 });
    return json(result);
  } catch (err) {
    console.error("job worker failed", err);
    return json({ error: String(err) }, 500);
  }
});
