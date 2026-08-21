// Shared clients for AutoVerkauf billing Edge Functions.
// Stripe API version pinned to 2026-05-27 — required for TWINT recurring /
// off-session support (spec §10). Do not float the version.

import Stripe from "npm:stripe@18";
import { createClient } from "npm:@supabase/supabase-js@2";

export const STRIPE_API_VERSION = "2026-05-27" as Stripe.LatestApiVersion;

export function stripeClient(): Stripe {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/** Service-role client — bypasses RLS. Edge Functions are the only writers. */
export function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Simple shared-secret gate for internal/admin endpoints (MVP). */
export function requireAdminKey(req: Request): Response | null {
  const expected = Deno.env.get("ADMIN_API_KEY");
  if (!expected) return json({ error: "ADMIN_API_KEY not configured" }, 500);
  if (req.headers.get("x-admin-key") !== expected) {
    return json({ error: "unauthorized" }, 401);
  }
  return null;
}

/** CHF (numeric string/number) → rappen integer for Stripe. */
export function chfToRappen(chf: number | string): number {
  return Math.round(Number(chf) * 100);
}

/**
 * HMAC accept-token: embedded in the buyer's "choose this offer" email link,
 * so acceptance is server-verifiable without buyer accounts.
 */
export async function acceptToken(offerId: string): Promise<string> {
  const secret = Deno.env.get("ACCEPT_TOKEN_SECRET");
  if (!secret) throw new Error("ACCEPT_TOKEN_SECRET is not set");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(offerId));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAcceptToken(offerId: string, token: string): Promise<boolean> {
  const expected = await acceptToken(offerId);
  if (expected.length !== token.length) return false;
  // constant-time compare
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}
