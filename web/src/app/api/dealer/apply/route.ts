import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password, name, companyName, canton, website } = await req.json();

  if (!email || !password || !name || !companyName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: user, error: userErr } = await supabaseAdmin
    .from("users")
    .insert({ email, name, password_hash: passwordHash, role: "DEALER" })
    .select("id")
    .single();

  if (userErr) {
    if (userErr.code === "23505") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: userErr.message }, { status: 500 });
  }

  const { error: dealerErr } = await supabaseAdmin
    .from("dealers")
    .insert({ user_id: user.id, company_name: companyName, canton: canton || null, website: website || null, status: "PENDING" });

  if (dealerErr) {
    return NextResponse.json({ error: dealerErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
