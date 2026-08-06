import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

/** Approved dealers: browse active buyer requests (no buyer PII) plus
 *  which of them this dealer has already answered. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("id, company_name, status")
    .eq("user_id", userId)
    .single();

  if (!dealer) return NextResponse.json({ error: "Not a dealer account" }, { status: 403 });
  if (dealer.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Dealer not approved", status: dealer.status, companyName: dealer.company_name },
      { status: 403 }
    );
  }

  const { data: requests, error } = await supabaseAdmin
    .from("vehicle_requests")
    .select(
      "id, budget_min, budget_max, body_types, brands, year_min, year_max, fuel_types, transmissions, mileage_max, canton, created_at"
    )
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: myOffers } = await supabaseAdmin
    .from("offers")
    .select("request_id")
    .eq("dealer_id", dealer.id);

  const answered = new Set((myOffers ?? []).map((o) => o.request_id));

  return NextResponse.json({
    companyName: dealer.company_name,
    offersSent: myOffers?.length ?? 0,
    requests: (requests ?? []).map((r) => ({ ...r, answered: answered.has(r.id) })),
  });
}
