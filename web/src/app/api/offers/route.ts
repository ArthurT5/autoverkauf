import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const { data: offers, error } = await supabaseAdmin
    .from("offers")
    .select("*, dealers(company_name, users(name))")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark pending offers as viewed
  await supabaseAdmin
    .from("offers")
    .update({ status: "VIEWED", viewed_at: new Date().toISOString() })
    .eq("request_id", requestId)
    .eq("status", "PENDING");

  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id;

  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("id, company_name, status")
    .eq("user_id", userId)
    .single();

  if (!dealer || dealer.status !== "APPROVED") {
    return NextResponse.json({ error: "Dealer not approved" }, { status: 403 });
  }

  const body = await req.json();

  const { data: offer, error } = await supabaseAdmin
    .from("offers")
    .insert({
      request_id: body.requestId,
      dealer_id: dealer.id,
      make: body.make,
      model: body.model,
      year: body.year,
      mileage: body.mileage,
      fuel: body.fuel,
      transmission: body.transmission,
      price: body.price,
      description: body.description ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify buyer
  const { data: request } = await supabaseAdmin
    .from("vehicle_requests")
    .select("buyers(user_id)")
    .eq("id", body.requestId)
    .single();

  if (request?.buyers) {
    const buyerUserId = (request.buyers as unknown as { user_id: string }).user_id;
    await supabaseAdmin.from("notifications").insert({
      user_id: buyerUserId,
      type: "NEW_OFFER",
      title: "New offer received",
      body: `${dealer.company_name} sent you an offer for ${body.make} ${body.model}`,
      link: `/buyer/requests/${body.requestId}`,
    });
  }

  return NextResponse.json({ offer }, { status: 201 });
}
