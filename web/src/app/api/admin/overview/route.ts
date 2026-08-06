import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if ((session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

/** Admin: platform counts + the pending dealer queue. */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [buyers, dealers, pending, requests, offers, pendingList] = await Promise.all([
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "BUYER"),
    supabaseAdmin.from("dealers").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
    supabaseAdmin.from("dealers").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    supabaseAdmin.from("vehicle_requests").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabaseAdmin.from("offers").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("dealers")
      .select("id, company_name, canton, website, created_at")
      .eq("status", "PENDING")
      .order("created_at", { ascending: true }),
  ]);

  return NextResponse.json({
    stats: {
      buyers: buyers.count ?? 0,
      dealersApproved: dealers.count ?? 0,
      dealersPending: pending.count ?? 0,
      activeRequests: requests.count ?? 0,
      offersTotal: offers.count ?? 0,
    },
    pendingDealers: pendingList.data ?? [],
  });
}

/** Admin: approve or reject a dealer application. */
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealerId, action } = await req.json();
  if (!dealerId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "dealerId and action (approve|reject) required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("dealers")
    .update({ status: action === "approve" ? "APPROVED" : "REJECTED" })
    .eq("id", dealerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
