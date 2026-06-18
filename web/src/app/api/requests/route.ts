import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  // Get buyer profile
  const { data: buyer } = await supabaseAdmin
    .from("buyers")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!buyer) return NextResponse.json({ requests: [] });

  const { data: requests, error } = await supabaseAdmin
    .from("vehicle_requests")
    .select("*, offers(count)")
    .eq("buyer_id", buyer.id)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const body = await req.json();

  // Upsert buyer profile
  const { data: buyer, error: buyerError } = await supabaseAdmin
    .from("buyers")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (buyerError) return NextResponse.json({ error: buyerError.message }, { status: 500 });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: request, error } = await supabaseAdmin
    .from("vehicle_requests")
    .insert({
      buyer_id: buyer.id,
      budget_min: body.budgetMin ?? 0,
      budget_max: body.budgetMax ?? 200000,
      body_types: body.bodyTypes ?? [],
      brands: body.brands ?? [],
      year_min: body.yearMin ?? null,
      year_max: body.yearMax ?? null,
      fuel_types: body.fuelTypes ?? [],
      transmissions: body.transmissions ?? [],
      mileage_max: body.mileageMax ?? null,
      must_have: body.mustHave ?? [],
      nice_to_have: body.niceToHave ?? [],
      canton: body.canton ?? null,
      notes: body.notes ?? null,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ request }, { status: 201 });
}
